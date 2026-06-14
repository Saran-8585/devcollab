import Project from '../models/Project.js';
import ProjectCollaborator from '../models/ProjectCollaborator.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Snippet from '../models/Snippet.js';
import PullRequest from '../models/PullRequest.js';
import Discussion from '../models/Discussion.js';
import { logActivity } from '../utils/activityLogger.js';

export async function listProjects(req, res, next) {
  try {
    const { language, sort, search } = req.query;
    const filter = { visibility: 'public' };
    if (language && language !== 'all') filter.primary_language = language;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const sortMap = { stars: { stars_count: -1 }, updated: { updated_at: -1 }, newest: { created_at: -1 } };
    const sortOpt = sortMap[sort] || sortMap.newest;

    const projects = await Project.find(filter).populate('owner_id', 'name username').sort(sortOpt).limit(50);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id).populate('owner_id', 'name username');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.visibility === 'private') {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const isMember = await ProjectCollaborator.findOne({ project_id: project._id, user_id: req.user.id });
      if (!isMember && project.owner_id._id.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Private project' });
      }
    }

    const collaborators = await ProjectCollaborator.find({ project_id: project._id })
      .populate('user_id', 'name username primary_language');

    const taskCounts = await Task.aggregate([
      { $match: { project_id: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    const tasks = await Task.find({ project_id: project._id })
      .populate('assignee_id', 'name username')
      .sort({ created_at: -1 });

    const snippets = await Snippet.find({ project_id: project._id })
      .populate('user_id', 'name username')
      .sort({ created_at: -1 });

    const pullRequests = await PullRequest.find({ project_id: project._id })
      .populate('opened_by', 'name username')
      .sort({ created_at: -1 });

    const discussions = await Discussion.find({ project_id: project._id })
      .populate('author_id', 'name username')
      .sort({ created_at: -1 });

    const mapUser = (doc, field) => {
      if (!doc[field]) return doc.toObject();
      const obj = doc.toObject();
      obj[`${field}_name`] = doc[field].name;
      obj[`${field}_username`] = doc[field].username;
      delete obj[field];
      return obj;
    };

    res.json({
      project: { ...project.toObject(), owner_name: project.owner_id?.name, owner_username: project.owner_id?.username },
      collaborators: collaborators.map(c => ({
        id: c.user_id?._id, name: c.user_id?.name, username: c.user_id?.username,
        primary_language: c.user_id?.primary_language, role: c.role, joined_at: c.joined_at,
      })),
      taskCounts,
      tasks: tasks.map(t => mapUser(t, 'assignee_id')),
      snippets: snippets.map(s => mapUser(s, 'user_id')),
      pullRequests: pullRequests.map(pr => ({ ...pr.toObject(), author_name: pr.opened_by?.name, author_username: pr.opened_by?.username })),
      discussions: discussions.map(d => ({ ...d.toObject(), author_name: d.author_id?.name, author_username: d.author_id?.username })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, description, visibility, primary_language, tags, readme_content } = req.body;
    const project = await Project.create({
      owner_id: req.user.id, name, description: description || '',
      visibility: visibility || 'public', primary_language: primary_language || 'JavaScript',
      tags: tags || [], readme_content: readme_content || '',
    });
    await ProjectCollaborator.create({ project_id: project._id, user_id: req.user.id, role: 'owner' });
    logActivity(req.user.id, 'create', 'project', null, `Created project ${name}`);
    res.status(201).json({ id: project._id, message: 'Project created' });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.owner_id.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { name, description, visibility, primary_language, tags, readme_content } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (visibility !== undefined) update.visibility = visibility;
    if (primary_language !== undefined) update.primary_language = primary_language;
    if (tags !== undefined) update.tags = tags;
    if (readme_content !== undefined) update.readme_content = readme_content;

    await Project.findByIdAndUpdate(req.params.id, { $set: update, updated_at: new Date() });

    const fields = Object.keys(update);
    const desc = 'Updated project' + (fields.length ? ': ' + fields.join(', ') : '');
    logActivity(req.user.id, 'update', 'project', null, desc);
    res.json({ message: 'Project updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.owner_id.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    await Project.findByIdAndDelete(req.params.id);
    logActivity(req.user.id, 'delete', 'project', null, `Deleted project ${project.name}`);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
}

export async function addCollaborator(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.owner_id.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await ProjectCollaborator.findOne({ project_id: project._id, user_id: user._id });
    if (existing) return res.status(400).json({ error: 'Already a collaborator' });

    await ProjectCollaborator.create({ project_id: project._id, user_id: user._id, role: 'collaborator' });
    logActivity(req.user.id, 'collaborate', 'project', null, `Added ${username} to ${project.name}`);
    res.json({ message: 'Collaborator added' });
  } catch (err) {
    next(err);
  }
}
