import mongoose from 'mongoose';

const projectCollaboratorSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'collaborator', enum: ['owner', 'collaborator'] },
  joined_at: { type: Date, default: Date.now },
});

export default mongoose.model('ProjectCollaborator', projectCollaboratorSchema);
