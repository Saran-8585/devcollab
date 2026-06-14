import { Router } from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const activities = await ActivityLog.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const total = await ActivityLog.countDocuments({ user_id: req.user.id });
    res.json({ activities, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
