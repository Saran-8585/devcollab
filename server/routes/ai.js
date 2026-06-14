import { Router } from 'express';
import { reviewPR, explainCodeHandler, fixBugHandler, generateCodeHandler, reviewCodeHandler } from '../controllers/aiController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.post('/review-pr', auth, reviewPR);
router.post('/explain', auth, explainCodeHandler);
router.post('/fix-bug', auth, fixBugHandler);
router.post('/generate', auth, generateCodeHandler);
router.post('/review-code', auth, reviewCodeHandler);

export default router;
