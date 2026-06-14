import mongoose from 'mongoose';

const pullRequestSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  opened_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  from_branch: { type: String, default: 'feature' },
  to_branch: { type: String, default: 'main' },
  code_diff: { type: String, default: '' },
  status: { type: String, default: 'open', enum: ['open', 'merged', 'closed'] },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('PullRequest', pullRequestSchema);
