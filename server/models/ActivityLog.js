import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action_type: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: Number },
  description: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('ActivityLog', activityLogSchema);
