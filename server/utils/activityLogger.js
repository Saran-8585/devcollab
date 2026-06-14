import ActivityLog from '../models/ActivityLog.js';

export async function logActivity(userId, actionType, entityType, entityId, description) {
  await ActivityLog.create({
    user_id: userId,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId || null,
    description: description || '',
  });
}
