import { Router } from 'express';
import { listTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/project/:projectId', auth, listTasks);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

export default router;
