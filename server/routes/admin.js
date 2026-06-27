import { Router } from 'express';
import { getOverview, listUsers, suspendUser, listFlags, dismissFlag } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = Router();
router.get('/stats', adminAuth, getOverview);
router.get('/users', adminAuth, listUsers);
router.patch('/users/:id/suspend', adminAuth, suspendUser);
router.get('/flags', adminAuth, listFlags);
router.patch('/flags/:id', adminAuth, dismissFlag);

export default router;
