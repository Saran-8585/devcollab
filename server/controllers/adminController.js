import { getDatabase } from '../db/database.js';

export function getStats(req, res, next) {
  try {
    const db = getDatabase();
    const totalDevs = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'developer'").get();
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    const totalSnippets = db.prepare('SELECT COUNT(*) as count FROM snippets').get();

    const projectsByLanguage = db.prepare(
      'SELECT primary_language as language, COUNT(*) as count FROM projects GROUP BY primary_language ORDER BY count DESC'
    ).all();

    const registrationsPerWeek = db.prepare(`
      SELECT strftime('%Y-%W', created_at) as week, COUNT(*) as count
      FROM users GROUP BY week ORDER BY week DESC LIMIT 12
    `).all();

    res.json({
      stats: { totalDevs: totalDevs.count, totalProjects: totalProjects.count, totalSnippets: totalSnippets.count },
      projectsByLanguage,
      registrationsPerWeek: registrationsPerWeek.reverse(),
    });
  } catch (err) {
    next(err);
  }
}

export function getUsers(req, res, next) {
  try {
    const db = getDatabase();
    const users = db.prepare(
      'SELECT id, name, email, username, role, is_suspended, contributions_count, created_at FROM users ORDER BY created_at DESC'
    ).all();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export function toggleSuspend(req, res, next) {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT is_suspended FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const newStatus = user.is_suspended ? 0 : 1;
    db.prepare('UPDATE users SET is_suspended = ? WHERE id = ?').run(newStatus, req.params.id);
    res.json({ suspended: !!newStatus, message: newStatus ? 'User suspended' : 'User activated' });
  } catch (err) {
    next(err);
  }
}

export function getFlags(req, res, next) {
  try {
    const db = getDatabase();
    const flags = db.prepare(
      `SELECT f.*, u.name as flagger_name, u.username as flagger_username
       FROM flags f JOIN users u ON f.flagged_by = u.id
       WHERE f.status = 'pending' ORDER BY f.created_at DESC`
    ).all();
    res.json({ flags });
  } catch (err) {
    next(err);
  }
}

export function dismissFlag(req, res, next) {
  try {
    const db = getDatabase();
    db.prepare("UPDATE flags SET status = 'dismissed' WHERE id = ?").run(req.params.id);
    res.json({ message: 'Flag dismissed' });
  } catch (err) {
    next(err);
  }
}
