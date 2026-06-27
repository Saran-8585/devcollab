import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  primary_language: { type: String, default: 'JavaScript' },
  skills: { type: [String], default: [] },
  role: { type: String, default: 'developer', enum: ['developer', 'admin', 'moderator'] },
  contributions_count: { type: Number, default: 0 },
  followers_count: { type: Number, default: 0 },
  following_count: { type: Number, default: 0 },
  is_suspended: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('User', userSchema);
