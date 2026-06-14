import { getDatabase } from '../db/database.js';
import { logActivity } from '../utils/activityLogger.js';

export function getProfile(req, res, next) {
  try {
    const db = getDatabase();
    const { username } = req.params;
    const user = db.prepare(
      'SELECT id, name, email, username, bio, location, website, primary_language, skills, role, contributions_count, followers_count, following_count, created_at FROM users WHERE username = ?'
    ).get(username);

    if (!user) return res.status(404).json({ error: 'User not found' });
    user.skills = JSON.parse(user.skills || '[]');

    const projects = db.prepare(
      `SELECT p.* FROM projects p
       JOIN project_collaborators pc ON p.id = pc.project_id
       WHERE pc.user_id = ? AND p.visibility = 'public'
       ORDER BY p.updated_at DESC LIMIT 6`
    ).all(user.id);

    const snippets = db.prepare(
      'SELECT id, title, language, likes_count, created_at FROM snippets WHERE user_id = ? AND visibility = ? ORDER BY created_at DESC LIMIT 10'
    ).all(user.id, 'public');

    const activity = db.prepare(
      'SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
    ).all(user.id);

    const isFollowing = req.user
      ? db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, user.id)
      : null;

    res.json({ user, projects, snippets, activity, isFollowing: !!isFollowing });
  } catch (err) {
    next(err);
  }
}

export function updateProfile(req, res, next) {
  try {
    const db = getDatabase();
    const { name, bio, location, website, primary_language, skills } = req.body;
    const skillsJson = skills ? JSON.stringify(skills) : undefined;

    db.prepare(
      `UPDATE users SET
        name = COALESCE(?, name),
        bio = COALESCE(?, bio),
        location = COALESCE(?, location),
        website = COALESCE(?, website),
        primary_language = COALESCE(?, primary_language),
        skills = COALESCE(?, skills)
       WHERE id = ?`
    ).run(name, bio, location, website, primary_language, skillsJson, req.user.id);

    logActivity(req.user.id, 'update', 'profile', req.user.id, 'Updated profile');
    res.json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
}

export function followUser(req, res, next) {
  try {
    const db = getDatabase();
    const { userId } = req.params;
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.user.id, userId);
    db.prepare('UPDATE users SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = ?) WHERE id = ?').run(userId, userId);
    db.prepare('UPDATE users SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = ?) WHERE id = ?').run(req.user.id, req.user.id);
    logActivity(req.user.id, 'follow', 'user', userId, 'Started following user');
    res.json({ message: 'Followed' });
  } catch (err) {
    next(err);
  }
}

export function unfollowUser(req, res, next) {
  try {
    const db = getDatabase();
    const { userId } = req.params;
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, userId);
    db.prepare('UPDATE users SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = ?) WHERE id = ?').run(userId, userId);
    db.prepare('UPDATE users SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = ?) WHERE id = ?').run(req.user.id, req.user.id);
    logActivity(req.user.id, 'unfollow', 'user', userId, 'Unfollowed user');
    res.json({ message: 'Unfollowed' });
  } catch (err) {
    next(err);
  }
}
