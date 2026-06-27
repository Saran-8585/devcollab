import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Snippet from '../models/Snippet.js';
import Discussion from '../models/Discussion.js';
import Flag from '../models/Flag.js';

export async function getOverview(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalSnippets = await Snippet.countDocuments();
    const totalDiscussions = await Discussion.countDocuments();
    const activeUsers = await User.countDocuments({ is_suspended: false });
    const suspendedUsers = await User.countDocuments({ is_suspended: true });

    res.json({ totalUsers, totalProjects, totalTasks, totalSnippets, totalDiscussions, activeUsers, suspendedUsers });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { query, role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status === 'suspended') filter.is_suspended = true;
    if (status === 'active') filter.is_suspended = false;
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ created_at: -1 }).limit(100);
    res.json({ users: users.map(u => ({ ...u.toObject(), skills: u.skills || [] })) });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['admin', 'moderator', 'developer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await User.findByIdAndUpdate(req.params.id, { $set: { role } });
    res.json({ message: 'User role updated' });
  } catch (err) {
    next(err);
  }
}

export async function suspendUser(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.params.id, { $set: { is_suspended: true } });
    res.json({ message: 'User suspended' });
  } catch (err) {
    next(err);
  }
}

export async function unsuspendUser(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.params.id, { $set: { is_suspended: false } });
    res.json({ message: 'User unsuspended' });
  } catch (err) {
    next(err);
  }
}

export async function listFlags(req, res, next) {
  try {
    const flags = await Flag.find({ status: 'pending' })
      .populate('reporter_id', 'name username')
      .sort({ created_at: -1 });
    res.json({
      flags: flags.map(f => ({
        id: f._id, entity_type: f.target_type, entity_id: f.target_id,
        flagger_username: f.reporter_id?.username, reason: f.reason,
        created_at: f.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function dismissFlag(req, res, next) {
  try {
    await Flag.findByIdAndUpdate(req.params.id, { $set: { status: 'dismissed' } });
    res.json({ message: 'Flag dismissed' });
  } catch (err) {
    next(err);
  }
}

export async function listProjects(req, res, next) {
  try {
    const { query } = req.query;
    const filter = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }
    const projects = await Project.find(filter)
      .populate('owner_id', 'name username')
      .sort({ created_at: -1 })
      .limit(100);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}
