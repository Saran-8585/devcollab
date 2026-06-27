import { Router } from 'express';
import { getUserDashboard } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/', auth, getUserDashboard);

export default router;
