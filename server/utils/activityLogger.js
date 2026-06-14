import { getDatabase } from '../db/database.js';

export function logActivity(userId, actionType, entityType, entityId, description) {
  const db = getDatabase();
  const stmt = db.prepare(
    `INSERT INTO activity_log (user_id, action_type, entity_type, entity_id, description)
     VALUES (?, ?, ?, ?, ?)`
  );
  stmt.run(userId, actionType, entityType, entityId || null, description);
}
