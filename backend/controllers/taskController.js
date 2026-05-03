import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get all tasks for a project
// @route   GET /api/tasks?projectId=:projectId
// @access  Private
// RBAC Rules:
//  - Admin: can view all tasks
//  - Owner: can view tasks in own projects
//  - Member: can view tasks in assigned projects
//  - Task Creator: can view own tasks
//  - Assigned Member: can view assigned tasks
export const getTasks = async (req, res) => {
  try {
    const projectRef = req.query.projectId || req.query.project;
    const userId = req.user._id;

    let query = {};

    if (req.user.role === 'Admin') {
      if (projectRef) {
        query.project = projectRef;
      }
    } else {
      const userProjects = await Project.find({
        $or: [
          { owner: userId },
          { members: userId }
        ]
      }).select('_id');

      if (projectRef) {
        const hasAccess = userProjects.some(p => p._id.toString() === projectRef);
        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to view tasks in this project'
          });
        }
        query.project = projectRef;
      } else {
        query.project = { $in: userProjects.map(p => p._id) };
      }
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
// RBAC Rules:
//  - Admin: can view any task
//  - Owner: can view tasks in own projects
//  - Member: can view tasks in assigned projects
//  - Task Creator: can view own tasks
//  - Assigned Member: can view assigned tasks
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name owner members')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!req.task) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task'
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
// RBAC Rules:
//  - Admin: can create tasks in any project
//  - Owner: can create tasks in own projects
//  - Member: can create tasks in assigned projects
export const createTask = async (req, res) => {
  try {
    const projectRef = req.body.projectId || req.body.project;
    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    if (!title || !projectRef) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and project'
      });
    }

    const project = await Project.findById(projectRef);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwnerOrMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(m => m.toString() === req.user._id.toString());

    if (!isOwnerOrMember && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tasks in this project'
      });
    }

    const task = new Task({
      title,
      description,
      project: projectRef,
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      dueDate,
      status: status || 'To Do'
    });

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task (with granular RBAC)
// @route   PUT /api/tasks/:id
// @access  Private
// RBAC Rules:
//  - Admin: can update any task
//  - Project Owner: can update any task in own projects
//  - Task Creator: can update title, description, status of own tasks
//  - Assigned Member: can ONLY update status of assigned tasks
//  - Others: no access
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).populate('project', 'owner members');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!req.task) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedTo) task.assignedTo = assignedTo;
    if (dueDate) task.dueDate = dueDate;

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete task (with RBAC)
// @route   DELETE /api/tasks/:id
// @access  Private
// RBAC Rules:
//  - Admin: can delete any task
//  - Project Owner: can delete any task in own projects
//  - Task Creator: can delete own tasks
//  - Assigned Member: CANNOT delete
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!req.task) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats/dashboard
// @access  Private
// RBAC Rules:
//  - Admin: can view all user stats
//  - Others: can view own stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const assignedToMe = await Task.countDocuments({ assignedTo: userId });
    const createdByMe = await Task.countDocuments({ createdBy: userId });
    
    const completedTasks = await Task.countDocuments({ 
      assignedTo: userId,
      status: 'Completed' 
    });
    
    const inProgressTasks = await Task.countDocuments({ 
      assignedTo: userId,
      status: 'In Progress' 
    });
    
    const todoTasks = await Task.countDocuments({ 
      assignedTo: userId,
      status: 'To Do' 
    });

    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      isOverdue: true,
      status: { $ne: 'Completed' }
    });

    res.status(200).json({
      success: true,
      stats: {
        assignedToMe,
        createdByMe,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
