import mongoose from 'mongoose';

const snippetLikeSchema = new mongoose.Schema({
  snippet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Snippet', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

snippetLikeSchema.index({ snippet_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('SnippetLike', snippetLikeSchema);
