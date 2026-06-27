import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  language: { type: String, default: 'JavaScript' },
  code: { type: String, required: true },
  tags: { type: [String], default: [] },
  visibility: { type: String, default: 'public', enum: ['public', 'private'] },
  views_count: { type: Number, default: 0 },
  likes_count: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Snippet', snippetSchema);
