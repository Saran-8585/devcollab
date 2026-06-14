import { Router } from 'express';
import { getProjectTasks, createTask, updateTaskStatus, updateTask, deleteTask } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/project/:projectId', auth, getProjectTasks);
router.post('/', auth, createTask);
router.patch('/:id/status', auth, updateTaskStatus);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

export default router;
