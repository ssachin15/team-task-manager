import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
// RBAC Rules:
//  - Admin: can view all projects
//  - Owner: can view own projects
//  - Member: can view assigned projects
export const getProjects = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'Admin') {
      query = {
        $or: [
          { owner: req.user._id },
          { members: req.user._id }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
// RBAC Rules:
//  - Admin: can view any project
//  - Owner: can view own project
//  - Member: can view if assigned
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!req.project) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project'
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
// RBAC Rules:
//  - Admin: can create projects
//  - Owner: can create projects (becomes owner)
//  - Member: can create projects (becomes owner)
export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project name'
      });
    }

    const project = new Project({
      name,
      description,
      owner: req.user._id,
      members: members || []
    });

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update project (with RBAC)
// @route   PUT /api/projects/:id
// @access  Private
// RBAC Rules:
//  - Admin: can update any project
//  - Owner: can update own project
//  - Member: CANNOT update
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!req.project) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or project owner can update this project'
      });
    }

    const { name, description, status, members } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (members) project.members = members;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete project (with RBAC)
// @route   DELETE /api/projects/:id
// @access  Private
// RBAC Rules:
//  - Admin: can delete any project
//  - Owner: can delete own project
//  - Member: CANNOT delete
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!req.project) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or project owner can delete this project'
      });
    }

    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add member to project (with RBAC)
// @route   POST /api/projects/:id/members
// @access  Private
// RBAC Rules:
//  - Admin: can add members to any project
//  - Owner: can add members to own project
//  - Member: CANNOT add members
export const addMember = async (req, res) => {
  try {
    const { memberId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!req.project) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or project owner can add members'
      });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (project.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    project.members.push(memberId);
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove member from project (with RBAC)
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private
// RBAC Rules:
//  - Admin: can remove members from any project
//  - Owner: can remove members from own project
//  - Member: CANNOT remove members
export const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!req.project) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or project owner can remove members'
      });
    }

    project.members = project.members.filter(id => id.toString() !== req.params.memberId);
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
