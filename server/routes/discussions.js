import { Router } from 'express';
import { getProjectDiscussions, createDiscussion, addReply, likeDiscussion } from '../controllers/discussionController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/project/:projectId', getProjectDiscussions);
router.post('/', auth, createDiscussion);
router.post('/:id/replies', auth, addReply);
router.post('/:id/like', auth, likeDiscussion);

export default router;
