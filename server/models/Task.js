import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'open', enum: ['backlog', 'open', 'in_progress', 'in_review', 'done', 'completed'] },
  priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high', 'critical'] },
  labels: { type: [String], default: [] },
  assignee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  due_date: { type: Date },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Task', taskSchema);
