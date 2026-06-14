import { Router } from 'express';
import { listSnippets, getSnippet, createSnippet, updateSnippet, deleteSnippet, likeSnippet } from '../controllers/snippetController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.get('/', listSnippets);
router.get('/:id', getSnippet);
router.post('/', auth, createSnippet);
router.put('/:id', auth, updateSnippet);
router.delete('/:id', auth, deleteSnippet);
router.post('/:id/like', auth, likeSnippet);

export default router;
