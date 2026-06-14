import { getDatabase } from '../db/database.js';
import { logActivity } from '../utils/activityLogger.js';

export function listProjects(req, res, next) {
  try {
    const db = getDatabase();
    const { language, sort, search } = req.query;
    let query = `SELECT p.*, u.name as owner_name, u.username as owner_username
      FROM projects p JOIN users u ON p.owner_id = u.id
      WHERE p.visibility = 'public'`;
    const params = [];

    if (language && language !== 'all') {
      query += ' AND p.primary_language = ?';
      params.push(language);
    }
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const sortMap = {
      stars: 'ORDER BY p.stars_count DESC',
      updated: 'ORDER BY p.updated_at DESC',
      newest: 'ORDER BY p.created_at DESC',
    };
    query += ' ' + (sortMap[sort] || sortMap.newest);

    const projects = db.prepare(query).all(...params);
    projects.forEach(p => {
      p.tags = JSON.parse(p.tags || '[]');
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export function getProject(req, res, next) {
  try {
    const db = getDatabase();
    const project = db.prepare(
      `SELECT p.*, u.name as owner_name, u.username as owner_username
       FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = ?`
    ).get(req.params.id);

    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.visibility === 'private') {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const isMember = db.prepare(
        'SELECT id FROM project_collaborators WHERE project_id = ? AND user_id = ?'
      ).get(project.id, req.user.id);
      if (!isMember && project.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Private project' });
      }
    }

    project.tags = JSON.parse(project.tags || '[]');

    const collaborators = db.prepare(
      `SELECT u.id, u.name, u.username, u.primary_language, u.avatar as avatar_text, pc.role, pc.joined_at
       FROM project_collaborators pc JOIN users u ON pc.user_id = u.id
       WHERE pc.project_id = ?`
    ).all(project.id);

    const taskCounts = db.prepare(
      `SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status`
    ).all(project.id);

    const tasks = db.prepare(
      `SELECT t.*, u.name as assignee_name, u.username as assignee_username
       FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.project_id = ? ORDER BY t.created_at DESC`
    ).all(project.id);

    const snippets = db.prepare(
      `SELECT s.*, u.name as author_name, u.username as author_username
       FROM snippets s JOIN users u ON s.user_id = u.id
       WHERE s.project_id = ? ORDER BY s.created_at DESC`
    ).all(project.id);

    const pullRequests = db.prepare(
      `SELECT pr.*, u.name as author_name, u.username as author_username
       FROM pull_requests pr JOIN users u ON pr.opened_by = u.id
       WHERE pr.project_id = ? ORDER BY pr.created_at DESC`
    ).all(project.id);

    const discussions = db.prepare(
      `SELECT d.*, u.name as author_name, u.username as author_username
       FROM discussions d JOIN users u ON d.author_id = u.id
       WHERE d.project_id = ? ORDER BY d.created_at DESC`
    ).all(project.id);

    res.json({ project, collaborators, taskCounts, tasks, snippets, pullRequests, discussions });
  } catch (err) {
    next(err);
  }
}

export function createProject(req, res, next) {
  try {
    const db = getDatabase();
    const { name, description, visibility, primary_language, tags, readme_content } = req.body;
    const tagsJson = JSON.stringify(tags || []);
    const result = db.prepare(
      `INSERT INTO projects (owner_id, name, description, visibility, primary_language, tags, readme_content)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, name, description, visibility || 'public', primary_language || 'JavaScript', tagsJson, readme_content || '');

    db.prepare('INSERT INTO project_collaborators (project_id, user_id, role) VALUES (?, ?, ?)').run(result.lastInsertRowid, req.user.id, 'owner');

    logActivity(req.user.id, 'create', 'project', result.lastInsertRowid, `Created project ${name}`);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Project created' });
  } catch (err) {
    next(err);
  }
}

export function updateProject(req, res, next) {
  try {
    const db = getDatabase();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { name, description, visibility, primary_language, tags, readme_content } = req.body;
    const tagsJson = tags ? JSON.stringify(tags) : undefined;

    db.prepare(
      `UPDATE projects SET
        name = COALESCE(?, name), description = COALESCE(?, description),
        visibility = COALESCE(?, visibility), primary_language = COALESCE(?, primary_language),
        tags = COALESCE(?, tags), readme_content = COALESCE(?, readme_content),
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(name, description, visibility, primary_language, tagsJson, readme_content, req.params.id);

    const fields = [];
    if (name !== undefined) fields.push('name');
    if (description !== undefined) fields.push('description');
    if (visibility !== undefined) fields.push('visibility');
    if (primary_language !== undefined) fields.push('language');
    if (tags !== undefined) fields.push('tags');
    if (readme_content !== undefined) fields.push('README');
    const desc = 'Updated project' + (fields.length ? ': ' + fields.join(', ') : '');
    logActivity(req.user.id, 'update', 'project', project.id, desc);
    res.json({ message: 'Project updated' });
  } catch (err) {
    next(err);
  }
}

export function deleteProject(req, res, next) {
  try {
    const db = getDatabase();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, 'delete', 'project', project.id, `Deleted project ${project.name}`);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
}

export function addCollaborator(req, res, next) {
  try {
    const db = getDatabase();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { username } = req.body;
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = db.prepare('SELECT id FROM project_collaborators WHERE project_id = ? AND user_id = ?').get(project.id, user.id);
    if (existing) return res.status(400).json({ error: 'Already a collaborator' });

    db.prepare('INSERT INTO project_collaborators (project_id, user_id, role) VALUES (?, ?, ?)').run(project.id, user.id, 'collaborator');
    logActivity(req.user.id, 'collaborate', 'project', project.id, `Added ${username} to ${project.name}`);
    res.json({ message: 'Collaborator added' });
  } catch (err) {
    next(err);
  }
}
