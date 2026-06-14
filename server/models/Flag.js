import mongoose from 'mongoose';

const flagSchema = new mongoose.Schema({
  entity_type: { type: String, required: true },
  entity_id: { type: Number, required: true },
  flagged_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, default: '' },
  status: { type: String, default: 'pending' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Flag', flagSchema);
