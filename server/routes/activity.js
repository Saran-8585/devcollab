import { Router } from 'express';
import { getDatabase } from '../db/database.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/:entityType/:entityId', auth, (req, res, next) => {
  try {
    const db = getDatabase();
    const { entityType, entityId } = req.params;

    const validTypes = ['project', 'snippet', 'task', 'pull_request', 'discussion', 'user'];
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const entries = db.prepare(
      `SELECT al.id, al.action_type, al.description, al.created_at,
              al.user_id, u.name as user_name, u.username as user_username
       FROM activity_log al
       JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = ? AND al.entity_id = ?
       ORDER BY al.created_at DESC
       LIMIT 20`
    ).all(entityType, parseInt(entityId));

    res.json({ entries });
  } catch (err) {
    next(err);
  }
});

export default router;
