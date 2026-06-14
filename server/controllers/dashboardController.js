import User from '../models/User.js';
import Project from '../models/Project.js';
import Snippet from '../models/Snippet.js';
import Task from '../models/Task.js';
import ProjectCollaborator from '../models/ProjectCollaborator.js';
import ActivityLog from '../models/ActivityLog.js';

export async function getStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalSnippets = await Snippet.countDocuments();
    const totalTasks = await Task.countDocuments();
    res.json({ totalUsers, totalProjects, totalSnippets, totalTasks });
  } catch (err) {
    next(err);
  }
}

export async function getTrending(req, res, next) {
  try {
    const projects = await Project.find({ visibility: 'public' })
      .populate('owner_id', 'name username')
      .sort({ stars_count: -1 })
      .limit(10);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function getUserDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    const myProjects = await Project.find({ owner_id: userId })
      .sort({ updated_at: -1 })
      .limit(5);

    const collabProjects = await ProjectCollaborator.find({ user_id: userId })
      .populate('project_id')
      .sort({ joined_at: -1 })
      .limit(5);

    const inProgressTasks = await Task.find({ assignee_id: userId, status: { $in: ['open', 'in_progress'] } })
      .populate('project_id', 'name')
      .sort({ created_at: -1 })
      .limit(10);

    const recentActivity = await ActivityLog.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(20);

    const fullName = req.user.name;
    const initial = fullName ? fullName.charAt(0).toUpperCase() : '?';

    res.json({
      projects: myProjects,
      collaborations: collabProjects.map(c => c.project_id).filter(Boolean),
      tasks: inProgressTasks.map(t => ({ ...t.toObject(), project_name: t.project_id?.name })),
      activity: recentActivity,
      avatar: initial,
    });
  } catch (err) {
    next(err);
  }
}
