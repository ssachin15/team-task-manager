import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats
} from '../controllers/taskController.js';
import { protect, checkTaskAccess, checkProjectOwnership } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Dashboard stats (put this before /:id route to avoid conflict)
router.get('/stats/dashboard', getDashboardStats);

// Task CRUD with RBAC middleware
router.get('/', getTasks);
router.post('/', checkProjectOwnership, createTask);
router.get('/:id', checkTaskAccess, getTask);
router.put('/:id', checkTaskAccess, updateTask);
router.delete('/:id', checkTaskAccess, deleteTask);

export default router;
