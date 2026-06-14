import { Router } from 'express';
import { getProjectPRs, getPR, createPR, updatePRStatus, addPRComment } from '../controllers/prController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/project/:projectId', auth, getProjectPRs);
router.get('/:id', auth, getPR);
router.post('/', auth, createPR);
router.patch('/:id/status', auth, updatePRStatus);
router.post('/:id/comments', auth, addPRComment);

export default router;
