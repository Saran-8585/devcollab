import { getDatabase } from '../db/database.js';
import { logActivity } from '../utils/activityLogger.js';

export function getProjectTasks(req, res, next) {
  try {
    const db = getDatabase();
    const tasks = db.prepare(
      `SELECT t.*, u.name as assignee_name, u.username as assignee_username
       FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.project_id = ? ORDER BY t.created_at DESC`
    ).all(req.params.projectId);
    tasks.forEach(t => { t.labels = JSON.parse(t.labels || '[]'); });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export function createTask(req, res, next) {
  try {
    const db = getDatabase();
    const { project_id, title, description, priority, labels, assignee_id, due_date } = req.body;
    const labelsJson = JSON.stringify(labels || []);

    const result = db.prepare(
      `INSERT INTO tasks (project_id, title, description, priority, labels, assignee_id, created_by, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(project_id, title, description || '', priority || 'Medium', labelsJson, assignee_id || null, req.user.id, due_date || null);

    logActivity(req.user.id, 'create', 'task', result.lastInsertRowid, `Created task: ${title}`);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Task created' });
  } catch (err) {
    next(err);
  }
}

export function updateTaskStatus(req, res, next) {
  try {
    const db = getDatabase();
    const { status } = req.body;
    db.prepare('UPDATE tasks SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, req.params.id);
    logActivity(req.user.id, 'update', 'task', req.params.id, `Moved task to ${status}`);
    res.json({ message: 'Status updated' });
  } catch (err) {
    next(err);
  }
}

export function updateTask(req, res, next) {
  try {
    const db = getDatabase();
    const { title, description, priority, labels, assignee_id, due_date, status } = req.body;
    const labelsJson = labels ? JSON.stringify(labels) : undefined;

    db.prepare(
      `UPDATE tasks SET
        title = COALESCE(?, title), description = COALESCE(?, description),
        priority = COALESCE(?, priority), labels = COALESCE(?, labels),
        assignee_id = COALESCE(?, assignee_id), due_date = COALESCE(?, due_date),
        status = COALESCE(?, status), updated_at = datetime('now')
       WHERE id = ?`
    ).run(title, description, priority, labelsJson, assignee_id, due_date, status, req.params.id);

    logActivity(req.user.id, 'update', 'task', req.params.id, 'Updated task');
    res.json({ message: 'Task updated' });
  } catch (err) {
    next(err);
  }
}

export function deleteTask(req, res, next) {
  try {
    const db = getDatabase();
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, 'delete', 'task', req.params.id, 'Deleted task');
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}
