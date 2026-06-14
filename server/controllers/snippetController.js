import { getDatabase } from '../db/database.js';
import { logActivity } from '../utils/activityLogger.js';

export function listSnippets(req, res, next) {
  try {
    const db = getDatabase();
    const { language, search, sort } = req.query;
    let query = `SELECT s.*, u.name as author_name, u.username as author_username
      FROM snippets s JOIN users u ON s.user_id = u.id
      WHERE s.visibility = 'public'`;
    const params = [];

    if (language && language !== 'all') {
      query += ' AND s.language = ?';
      params.push(language);
    }
    if (search) {
      query += ' AND (s.title LIKE ? OR s.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const sortMap = { likes: 'ORDER BY s.likes_count DESC', newest: 'ORDER BY s.created_at DESC' };
    query += ' ' + (sortMap[sort] || sortMap.newest);
    query += ' LIMIT 50';

    const snippets = db.prepare(query).all(...params);
    snippets.forEach(s => { s.tags = JSON.parse(s.tags || '[]'); });
    res.json({ snippets });
  } catch (err) {
    next(err);
  }
}

export function getSnippet(req, res, next) {
  try {
    const db = getDatabase();
    const snippet = db.prepare(
      `SELECT s.*, u.name as author_name, u.username as author_username, u.primary_language
       FROM snippets s JOIN users u ON s.user_id = u.id WHERE s.id = ?`
    ).get(req.params.id);

    if (!snippet) return res.status(404).json({ error: 'Not found' });
    snippet.tags = JSON.parse(snippet.tags || '[]');

    db.prepare('UPDATE snippets SET views_count = views_count + 1 WHERE id = ?').run(snippet.id);

    const comments = db.prepare(
      `SELECT dr.*, u.name as author_name, u.username as author_username
       FROM discussion_replies dr JOIN users u ON dr.author_id = u.id
       WHERE dr.discussion_id = ? ORDER BY dr.created_at`
    ).all(snippet.id);

    res.json({ snippet, comments });
  } catch (err) {
    next(err);
  }
}

export function createSnippet(req, res, next) {
  try {
    const db = getDatabase();
    const { title, description, language, code_content, tags, visibility, project_id } = req.body;
    const tagsJson = JSON.stringify(tags || []);

    const result = db.prepare(
      `INSERT INTO snippets (user_id, project_id, title, description, language, code_content, tags, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, project_id || null, title, description || '', language || 'JavaScript', code_content, tagsJson, visibility || 'public');

    logActivity(req.user.id, 'create', 'snippet', result.lastInsertRowid, `Posted snippet: ${title}`);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Snippet created' });
  } catch (err) {
    next(err);
  }
}

export function updateSnippet(req, res, next) {
  try {
    const db = getDatabase();
    const snippet = db.prepare('SELECT * FROM snippets WHERE id = ?').get(req.params.id);
    if (!snippet || snippet.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, language, code_content, tags, visibility } = req.body;
    const tagsJson = tags ? JSON.stringify(tags) : undefined;

    db.prepare(
      `UPDATE snippets SET
        title = COALESCE(?, title), description = COALESCE(?, description),
        language = COALESCE(?, language), code_content = COALESCE(?, code_content),
        tags = COALESCE(?, tags), visibility = COALESCE(?, visibility)
       WHERE id = ?`
    ).run(title, description, language, code_content, tagsJson, visibility, req.params.id);

    logActivity(req.user.id, 'update', 'snippet', snippet.id, 'Updated snippet');
    res.json({ message: 'Snippet updated' });
  } catch (err) {
    next(err);
  }
}

export function deleteSnippet(req, res, next) {
  try {
    const db = getDatabase();
    const snippet = db.prepare('SELECT * FROM snippets WHERE id = ?').get(req.params.id);
    if (!snippet || snippet.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    db.prepare('DELETE FROM snippets WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, 'delete', 'snippet', snippet.id, 'Deleted snippet');
    res.json({ message: 'Snippet deleted' });
  } catch (err) {
    next(err);
  }
}

export function likeSnippet(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM snippet_likes WHERE snippet_id = ? AND user_id = ?').get(id, req.user.id);
    if (existing) {
      db.prepare('DELETE FROM snippet_likes WHERE snippet_id = ? AND user_id = ?').run(id, req.user.id);
      db.prepare('UPDATE snippets SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(id);
      res.json({ liked: false });
    } else {
      db.prepare('INSERT INTO snippet_likes (snippet_id, user_id) VALUES (?, ?)').run(id, req.user.id);
      db.prepare('UPDATE snippets SET likes_count = likes_count + 1 WHERE id = ?').run(id);
      logActivity(req.user.id, 'like', 'snippet', id, 'Liked snippet');
      res.json({ liked: true });
    }
  } catch (err) {
    next(err);
  }
}
