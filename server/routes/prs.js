import { Router } from 'express';
import { listPRs, getPR, createPR, updatePR, addComment } from '../controllers/prController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/project/:projectId', auth, listPRs);
router.get('/:id', auth, getPR);
router.post('/', auth, createPR);
router.patch('/:id/status', auth, updatePR);
router.post('/:id/comments', auth, addComment);

export default router;
