import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getProfile, updateProfile, followUser, unfollowUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/:username', (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {}
  }
  getProfile(req, res, next);
});

router.put('/profile', auth, updateProfile);
router.post('/follow/:userId', auth, followUser);
router.delete('/follow/:userId', auth, unfollowUser);

export default router;
