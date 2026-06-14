import { Router } from 'express';
import { getSummary, getTasks, getActivity } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/', auth, getSummary);
router.get('/tasks', auth, getTasks);
router.get('/activity', auth, getActivity);

export default router;
