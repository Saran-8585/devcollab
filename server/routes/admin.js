import { Router } from 'express';
import { getStats, getUsers, toggleSuspend, getFlags, dismissFlag } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = Router();
router.get('/stats', adminAuth, getStats);
router.get('/users', adminAuth, getUsers);
router.patch('/users/:id/suspend', adminAuth, toggleSuspend);
router.get('/flags', adminAuth, getFlags);
router.patch('/flags/:id', adminAuth, dismissFlag);

export default router;
