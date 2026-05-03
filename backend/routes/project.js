import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} from '../controllers/projectController.js';
import { protect, checkProjectOwnership, checkProjectModifyAccess, checkMemberAddAccess } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Project CRUD
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', checkProjectOwnership, getProject);
router.put('/:id', checkProjectModifyAccess, updateProject);
router.delete('/:id', checkProjectModifyAccess, deleteProject);

// Member management
router.post('/:id/members', checkMemberAddAccess, addMember);
router.delete('/:id/members/:memberId', checkProjectModifyAccess, removeMember);

export default router;
