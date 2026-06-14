import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, username, bio, primary_language, skills } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ error: 'Email or username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed, username,
      bio: bio || '', primary_language: primary_language || 'JavaScript',
      skills: skills || [],
    });

    const token = jwt.sign(
      { id: user._id, email, username, role: 'developer' },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );

    logActivity(user._id, 'register', 'user', null, 'Joined DevCollab');
    res.status(201).json({ token, user: { id: user._id, name, email, username, role: 'developer' } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.is_suspended) return res.status(403).json({ error: 'Account suspended' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );

    logActivity(user._id, 'login', 'user', null, 'Logged in');
    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        username: user.username, role: user.role,
        primary_language: user.primary_language,
        avatar: user.name?.charAt(0)?.toUpperCase(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user: { ...user.toObject(), skills: user.skills || [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
