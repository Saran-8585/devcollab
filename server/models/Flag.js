import mongoose from 'mongoose';

const flagSchema = new mongoose.Schema({
  reporter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target_type: { type: String, required: true },
  target_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'pending' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Flag', flagSchema);
