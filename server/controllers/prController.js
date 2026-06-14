import PullRequest from '../models/PullRequest.js';
import PRComment from '../models/PRComment.js';
import Project from '../models/Project.js';
import ProjectCollaborator from '../models/ProjectCollaborator.js';
import { logActivity } from '../utils/activityLogger.js';

export async function listPRs(req, res, next) {
  try {
    const { projectId, status } = req.query;
    const filter = {};
    if (projectId) filter.project_id = projectId;
    if (status && status !== 'all') filter.status = status;

    const prs = await PullRequest.find(filter)
      .populate('opened_by', 'name username')
      .populate('project_id', 'name')
      .sort({ created_at: -1 });

    res.json({
      pullRequests: prs.map(pr => ({
        ...pr.toObject(), author_name: pr.opened_by?.name, author_username: pr.opened_by?.username,
        project_name: pr.project_id?.name,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createPR(req, res, next) {
  try {
    const { project_id, title, description, source_branch, target_branch } = req.body;
    const project = await Project.findById(project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = await ProjectCollaborator.findOne({ project_id, user_id: req.user.id });
    if (!isMember && project.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not a collaborator' });
    }

    const pr = await PullRequest.create({
      project_id, title, description: description || '',
      source_branch: source_branch || 'main', target_branch: target_branch || 'main',
      opened_by: req.user.id, status: 'open',
    });
    logActivity(req.user.id, 'create', 'pr', pr._id, `Opened PR "${title}"`);
    res.status(201).json({ id: pr._id, message: 'PR created' });
  } catch (err) {
    next(err);
  }
}

export async function getPR(req, res, next) {
  try {
    const pr = await PullRequest.findById(req.params.id)
      .populate('opened_by', 'name username')
      .populate('project_id', 'name owner_id');
    if (!pr) return res.status(404).json({ error: 'Not found' });

    const comments = await PRComment.find({ pr_id: pr._id })
      .populate('user_id', 'name username')
      .sort({ created_at: 1 });

    res.json({
      pullRequest: {
        ...pr.toObject(), author_name: pr.opened_by?.name, author_username: pr.opened_by?.username,
        project_name: pr.project_id?.name,
      },
      comments: comments.map(c => ({
        ...c.toObject(), author_name: c.user_id?.name, author_username: c.user_id?.username,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePR(req, res, next) {
  try {
    const pr = await PullRequest.findById(req.params.id);
    if (!pr) return res.status(404).json({ error: 'Not found' });
    if (pr.opened_by.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { title, description, status, source_branch, target_branch } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (source_branch !== undefined) update.source_branch = source_branch;
    if (target_branch !== undefined) update.target_branch = target_branch;

    await PullRequest.findByIdAndUpdate(req.params.id, { $set: update, updated_at: new Date() });
    logActivity(req.user.id, 'update', 'pr', null, `Updated PR #${req.params.id}`);
    res.json({ message: 'PR updated' });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req, res, next) {
  try {
    const { content } = req.body;
    const pr = await PullRequest.findById(req.params.id);
    if (!pr) return res.status(404).json({ error: 'PR not found' });

    const comment = await PRComment.create({
      pr_id: pr._id, user_id: req.user.id, content,
    });
    logActivity(req.user.id, 'comment', 'pr', pr._id, `Commented on PR #${req.params.id}`);
    res.status(201).json({ id: comment._id, message: 'Comment added' });
  } catch (err) {
    next(err);
  }
}
