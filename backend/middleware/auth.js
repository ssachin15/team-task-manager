import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check for admin role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check project ownership/access - verify user can access the project
export const checkProjectOwnership = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner, member, or admin
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check if user can modify project (edit/delete)
export const checkProjectModifyAccess = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner or admin can modify/delete
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or project owner can modify this project'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check task access - verify user can access the task
export const checkTaskAccess = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    const task = await Task.findById(taskId)
      .populate('project', 'owner members');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check project access first
    const project = task.project;
    const isProjectOwner = project.owner.toString() === req.user._id.toString();
    const isProjectMember = project.members.some(m => m.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'Admin';
    const isTaskCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();

    // For GET requests - owner, member, admin, creator, or assigned
    if (req.method === 'GET') {
      if (!isProjectOwner && !isProjectMember && !isAdmin && !isTaskCreator && !isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this task'
        });
      }
    }

    // For PUT requests - admin, project owner, task creator, or assigned user (status only)
    if (req.method === 'PUT') {
      if (!isAdmin && !isProjectOwner && !isTaskCreator && !isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task'
        });
      }
      
      // If assigned user (not creator, owner, or admin), can only update status
      if (isAssigned && !isTaskCreator && !isProjectOwner && !isAdmin) {
        const allowedFields = ['status'];
        const attemptedFields = Object.keys(req.body);
        const hasDisallowedFields = attemptedFields.some(field => !allowedFields.includes(field));
        
        if (hasDisallowedFields) {
          return res.status(403).json({
            success: false,
            message: 'Assigned members can only update task status'
          });
        }
      }
    }

    // For DELETE requests - admin, project owner, or task creator
    if (req.method === 'DELETE') {
      if (!isAdmin && !isProjectOwner && !isTaskCreator) {
        return res.status(403).json({
          success: false,
          message: 'Only admin, project owner, or task creator can delete this task'
        });
      }
    }

    req.task = task;
    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check if user can add members to project
export const checkMemberAddAccess = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner or admin can add members
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or project owner can add members'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
