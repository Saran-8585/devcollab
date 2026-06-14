import mongoose from 'mongoose';

const prCommentSchema = new mongoose.Schema({
  pr_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PullRequest', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  line_reference: { type: Number },
  content: { type: String, required: true },
  review_status: { type: String, default: 'pending', enum: ['pending', 'approved', 'changes_requested'] },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('PRComment', prCommentSchema);
