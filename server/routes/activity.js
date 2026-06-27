import { Router } from 'express';
import ActivityLog from '../models/ActivityLog.js';
import auth from '../middleware/auth.js';

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

router.get('/:entityType/:entityId', auth, async (req, res) => {
  try {
    const entries = await ActivityLog.find({
      entity_type: req.params.entityType,
      entity_id: req.params.entityId,
    })
      .populate('user_id', 'name username')
      .sort({ created_at: -1 })
      .limit(50);

    res.json({
      entries: entries.map(e => ({
        id: e._id, user_id: e.user_id?._id,
        user_name: e.user_id?.name, action_type: e.action_type,
        description: e.description, created_at: e.created_at,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
