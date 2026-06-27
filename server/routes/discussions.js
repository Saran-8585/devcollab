import { Router } from 'express';
import { listDiscussions, createDiscussion, addReply } from '../controllers/discussionController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/project/:projectId', listDiscussions);
router.post('/', auth, createDiscussion);
router.post('/:id/replies', auth, addReply);

export default router;
