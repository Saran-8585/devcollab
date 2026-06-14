import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  visibility: { type: String, default: 'public', enum: ['public', 'private'] },
  primary_language: { type: String, default: 'JavaScript' },
  tags: { type: [String], default: [] },
  readme_content: { type: String, default: '' },
  stars_count: { type: Number, default: 0 },
  forks_count: { type: Number, default: 0 },
  is_archived: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Project', projectSchema);
