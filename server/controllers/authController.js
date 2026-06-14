import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db/database.js';
import { logActivity } from '../utils/activityLogger.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, username, bio, primary_language, skills } = req.body;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const skillsJson = JSON.stringify(skills || []);
    const result = db.prepare(
      `INSERT INTO users (name, email, password, username, bio, primary_language, skills)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(name, email, hashed, username, bio || '', primary_language || 'JavaScript', skillsJson);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, username, role: 'developer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logActivity(result.lastInsertRowid, 'register', 'user', result.lastInsertRowid, 'Joined DevCollab');

    res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, username, role: 'developer' } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ error: 'Account suspended' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logActivity(user.id, 'login', 'user', user.id, 'Logged in');

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        primary_language: user.primary_language,
        avatar: user.name.charAt(0).toUpperCase(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export function me(req, res) {
  const db = getDatabase();
  const user = db.prepare('SELECT id, name, email, username, bio, location, website, primary_language, skills, role, contributions_count, followers_count, following_count, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.skills = JSON.parse(user.skills || '[]');
  res.json({ user });
}
