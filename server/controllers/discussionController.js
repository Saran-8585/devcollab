import { getDatabase } from '../db/database.js';
import { logActivity } from '../utils/activityLogger.js';

export function getProjectDiscussions(req, res, next) {
  try {
    const db = getDatabase();
    const { projectId } = req.params;
    let discussions;
    if (projectId === 'all') {
      discussions = db.prepare(
        `SELECT d.*, u.name as author_name, u.username as author_username, p.name as project_name
         FROM discussions d JOIN users u ON d.author_id = u.id
         JOIN projects p ON d.project_id = p.id
         WHERE p.visibility = 'public'
         ORDER BY d.created_at DESC`
      ).all();
    } else {
      discussions = db.prepare(
        `SELECT d.*, u.name as author_name, u.username as author_username
         FROM discussions d JOIN users u ON d.author_id = u.id
         WHERE d.project_id = ? ORDER BY d.created_at DESC`
      ).all(projectId);
    }
    res.json({ discussions });
  } catch (err) {
    next(err);
  }
}

export function createDiscussion(req, res, next) {
  try {
    const db = getDatabase();
    const { project_id, title, body, category } = req.body;
    const result = db.prepare(
      `INSERT INTO discussions (project_id, author_id, title, body, category)
       VALUES (?, ?, ?, ?, ?)`
    ).run(project_id, req.user.id, title, body || '', category || 'general');

    logActivity(req.user.id, 'create', 'discussion', result.lastInsertRowid, `Started discussion: ${title}`);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Discussion created' });
  } catch (err) {
    next(err);
  }
}

export function addReply(req, res, next) {
  try {
    const db = getDatabase();
    const { content } = req.body;
    const result = db.prepare(
      `INSERT INTO discussion_replies (discussion_id, author_id, content) VALUES (?, ?, ?)`
    ).run(req.params.id, req.user.id, content);

    db.prepare('UPDATE discussions SET replies_count = replies_count + 1 WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, 'reply', 'discussion', req.params.id, 'Replied to discussion');
    res.status(201).json({ id: result.lastInsertRowid, message: 'Reply added' });
  } catch (err) {
    next(err);
  }
}

export function likeDiscussion(req, res, next) {
  try {
    const db = getDatabase();
    db.prepare('UPDATE discussions SET views_count = views_count + 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Viewed' });
  } catch (err) {
    next(err);
  }
}
