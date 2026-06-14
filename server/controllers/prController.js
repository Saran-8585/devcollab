import { getDatabase } from '../db/database.js';
import { logActivity } from '../utils/activityLogger.js';

export function getProjectPRs(req, res, next) {
  try {
    const db = getDatabase();
    const prs = db.prepare(
      `SELECT pr.*, u.name as author_name, u.username as author_username,
       (SELECT COUNT(*) FROM pr_comments WHERE pr_id = pr.id) as comments_count
       FROM pull_requests pr JOIN users u ON pr.opened_by = u.id
       WHERE pr.project_id = ? ORDER BY pr.created_at DESC`
    ).all(req.params.projectId);
    res.json({ pullRequests: prs });
  } catch (err) {
    next(err);
  }
}

export function getPR(req, res, next) {
  try {
    const db = getDatabase();
    const pr = db.prepare(
      `SELECT pr.*, u.name as author_name, u.username as author_username
       FROM pull_requests pr JOIN users u ON pr.opened_by = u.id WHERE pr.id = ?`
    ).get(req.params.id);

    if (!pr) return res.status(404).json({ error: 'Not found' });

    const comments = db.prepare(
      `SELECT pc.*, u.name as author_name, u.username as author_username
       FROM pr_comments pc JOIN users u ON pc.user_id = u.id
       WHERE pc.pr_id = ? ORDER BY pc.created_at`
    ).all(pr.id);

    let aiReview = null;
    if (pr.ai_review_id) {
      aiReview = db.prepare('SELECT * FROM ai_reviews WHERE id = ?').get(pr.ai_review_id);
      if (aiReview) {
        aiReview.issues = JSON.parse(aiReview.issues || '[]');
        aiReview.strengths = JSON.parse(aiReview.strengths || '[]');
        aiReview.security_concerns = JSON.parse(aiReview.security_concerns || '[]');
        aiReview.performance_notes = JSON.parse(aiReview.performance_notes || '[]');
      }
    }

    res.json({ pullRequest: pr, comments, aiReview });
  } catch (err) {
    next(err);
  }
}

export function createPR(req, res, next) {
  try {
    const db = getDatabase();
    const { project_id, title, description, from_branch, to_branch, code_diff } = req.body;
    const result = db.prepare(
      `INSERT INTO pull_requests (project_id, opened_by, title, description, from_branch, to_branch, code_diff)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(project_id, req.user.id, title, description || '', from_branch || 'feature', to_branch || 'main', code_diff || '');

    logActivity(req.user.id, 'create', 'pull_request', result.lastInsertRowid, `Opened PR: ${title}`);
    res.status(201).json({ id: result.lastInsertRowid, message: 'PR created' });
  } catch (err) {
    next(err);
  }
}

export function updatePRStatus(req, res, next) {
  try {
    const db = getDatabase();
    const { status } = req.body;
    db.prepare('UPDATE pull_requests SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, req.params.id);
    logActivity(req.user.id, 'update', 'pull_request', req.params.id, `PR status: ${status}`);
    res.json({ message: 'Status updated' });
  } catch (err) {
    next(err);
  }
}

export function addPRComment(req, res, next) {
  try {
    const db = getDatabase();
    const { line_reference, content, review_status } = req.body;
    const result = db.prepare(
      `INSERT INTO pr_comments (pr_id, user_id, line_reference, content, review_status)
       VALUES (?, ?, ?, ?, ?)`
    ).run(req.params.id, req.user.id, line_reference || null, content, review_status || 'pending');

    logActivity(req.user.id, 'comment', 'pull_request', req.params.id, 'Reviewed PR');
    res.status(201).json({ id: result.lastInsertRowid, message: 'Comment added' });
  } catch (err) {
    next(err);
  }
}
