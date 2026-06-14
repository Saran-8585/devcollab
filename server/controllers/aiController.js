import { getDatabase } from '../db/database.js';
import { reviewCodeDiff, explainCode, fixBug, generateCode, reviewCode } from '../ai/ollama.js';
import { logActivity } from '../utils/activityLogger.js';

export async function reviewPR(req, res, next) {
  try {
    const { pr_id, code_diff, title, language } = req.body;
    const result = await reviewCodeDiff(code_diff, title, language || 'JavaScript');

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const db = getDatabase();
    const reviewData = result.review;
    const insert = db.prepare(
      `INSERT INTO ai_reviews (pr_id, user_id, context_type, overall_assessment, issues, strengths, security_concerns, performance_notes, overall_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const info = insert.run(
      pr_id || null, req.user.id, 'pr_review',
      reviewData.overall_assessment,
      JSON.stringify(reviewData.issues),
      JSON.stringify(reviewData.strengths),
      JSON.stringify(reviewData.security_concerns),
      JSON.stringify(reviewData.performance_notes),
      reviewData.overall_score
    );

    if (pr_id) {
      db.prepare('UPDATE pull_requests SET ai_review_id = ? WHERE id = ?').run(info.lastInsertRowid, pr_id);
    }

    logActivity(req.user.id, 'ai_review', 'pull_request', pr_id, 'AI code review completed');
    res.json({ review: { ...reviewData, id: info.lastInsertRowid } });
  } catch (err) {
    next(err);
  }
}

export async function explainCodeHandler(req, res, next) {
  try {
    const { code, language } = req.body;
    logActivity(req.user.id, 'ai_explain', 'snippet', null, 'AI code explanation');
    await explainCode(code, language || 'JavaScript', res);
  } catch (err) {
    next(err);
  }
}

export async function fixBugHandler(req, res, next) {
  try {
    const { code, bug_description, language } = req.body;
    const result = await fixBug(code, bug_description, language || 'JavaScript');
    logActivity(req.user.id, 'ai_fix', 'snippet', null, 'AI bug fix');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function generateCodeHandler(req, res, next) {
  try {
    const { description, language, complexity } = req.body;
    logActivity(req.user.id, 'ai_generate', 'snippet', null, 'AI code generation');
    await generateCode(description, language || 'JavaScript', complexity || 'moderate', res);
  } catch (err) {
    next(err);
  }
}

export async function reviewCodeHandler(req, res, next) {
  try {
    const { code, language } = req.body;
    const result = await reviewCode(code, language || 'JavaScript');
    logActivity(req.user.id, 'ai_review', 'snippet', null, 'AI code review');
    res.json(result);
  } catch (err) {
    next(err);
  }
}
