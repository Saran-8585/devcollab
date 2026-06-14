import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devcollab';

let cached = null;

export async function initDatabase() {
  if (cached) return cached;
  await mongoose.connect(MONGO_URI);
  cached = mongoose.connection;
  console.log('MongoDB connected');
  return cached;
}

export function getDatabase() {
  return mongoose.connection;
}
