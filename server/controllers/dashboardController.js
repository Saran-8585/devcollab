import { getDatabase } from '../db/database.js';

export function getSummary(req, res, next) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const openTasks = db.prepare(
      "SELECT COUNT(*) as count FROM tasks WHERE assignee_id = ? AND status NOT IN ('done')"
    ).get(userId);

    const myProjects = db.prepare(
      'SELECT COUNT(DISTINCT project_id) as count FROM project_collaborators WHERE user_id = ?'
    ).get(userId);

    const mySnippets = db.prepare(
      'SELECT COUNT(*) as count FROM snippets WHERE user_id = ?'
    ).get(userId);

    const myPRs = db.prepare(
      'SELECT COUNT(*) as count FROM pull_requests WHERE opened_by = ?'
    ).get(userId);

    res.json({
      openTasks: openTasks.count,
      myProjects: myProjects.count,
      mySnippets: mySnippets.count,
      myPRs: myPRs.count,
    });
  } catch (err) {
    next(err);
  }
}

export function getTasks(req, res, next) {
  try {
    const db = getDatabase();
    const { project, priority, status } = req.query;
    let query = `SELECT t.*, p.name as project_name, u.name as creator_name
      FROM tasks t JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.assignee_id = ?`;
    const params = [req.user.id];

    if (project) { query += ' AND p.id = ?'; params.push(project); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    if (status) { query += ' AND t.status = ?'; params.push(status); }

    query += ' ORDER BY t.due_date ASC';
    const tasks = db.prepare(query).all(...params);
    tasks.forEach(t => { t.labels = JSON.parse(t.labels || '[]'); });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export function getActivity(req, res, next) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const activity = db.prepare(
      'SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 30'
    ).all(userId);

    const heatmap = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM activity_log
      WHERE user_id = ? AND created_at >= datetime('now', '-365 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all(userId);

    res.json({ activity, heatmap });
  } catch (err) {
    next(err);
  }
}
