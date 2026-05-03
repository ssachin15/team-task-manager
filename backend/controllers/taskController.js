import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get all tasks for a project
// @route   GET /api/tasks?projectId=:projectId
// @access  Private
export const getTasks = async (req, res) => {
  try {
    // Accept both ?projectId= and ?project= for flexibility
    const projectRef = req.query.projectId || req.query.project;

    let query = {};
    if (projectRef) {
      query.project = projectRef;
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
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
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
export const createTask = async (req, res) => {
  try {
    // Accept both 'project' and 'projectId' from body
    const projectRef = req.body.projectId || req.body.project;
    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    if (!title || !projectRef) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and project'
      });
    }

    // Check if project exists
    const project = await Project.findById(projectRef);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
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
      // Default assignee to the creator if not provided
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

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is creator, assigned to, or admin
    const isAuthorized = 
      task.createdBy.toString() === req.user._id.toString() ||
      task.assignedTo.toString() === req.user._id.toString() ||
      req.user.role === 'Admin';

    if (!isAuthorized) {
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

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      task.createdBy.toString() === req.user._id.toString() ||
      req.user.role === 'Admin';

    if (!isAuthorized) {
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
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tasks assigned to user
    const assignedToMe = await Task.countDocuments({ assignedTo: userId });
    
    // Tasks created by user
    const createdByMe = await Task.countDocuments({ createdBy: userId });
    
    // Completed tasks
    const completedTasks = await Task.countDocuments({ 
      assignedTo: userId,
      status: 'Completed' 
    });
    
    // In progress tasks
    const inProgressTasks = await Task.countDocuments({ 
      assignedTo: userId,
      status: 'In Progress' 
    });
    
    // To do tasks
    const todoTasks = await Task.countDocuments({ 
      assignedTo: userId,
      status: 'To Do' 
    });

    // Overdue tasks
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