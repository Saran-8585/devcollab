import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logActivity } from '../utils/activityLogger.js';

export async function listTasks(req, res, next) {
  try {
    const { projectId, status, assignee, priority } = req.query;
    const filter = {};
    if (projectId) filter.project_id = projectId;
    if (status && status !== 'all') filter.status = status;
    if (assignee) filter.assignee_id = assignee;
    if (priority && priority !== 'all') filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignee_id', 'name username')
      .populate('project_id', 'name')
      .sort({ created_at: -1 });

    res.json({ tasks: tasks.map(t => {
      const obj = t.toObject();
      obj.assignee_name = t.assignee_id?.name;
      obj.assignee_username = t.assignee_id?.username;
      obj.project_name = t.project_id?.name;
      delete obj.assignee_id;
      delete obj.project_id;
      return obj;
    }) });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, project_id, assignee_id, priority, status, tags, due_date } = req.body;
    const project = await Project.findById(project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner_id.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const task = await Task.create({
      project_id, title, description: description || '', assignee_id: assignee_id || null,
      priority: priority || 'medium', status: status || 'open', tags: tags || [], due_date: due_date || null,
    });
    await Project.findByIdAndUpdate(project_id, { $inc: { tasks_count: 1 }, updated_at: new Date() });
    logActivity(req.user.id, 'create', 'task', task._id, `Created task "${title}"`);
    res.status(201).json({ id: task._id, message: 'Task created' });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });

    const project = await Project.findById(task.project_id);
    if (!project || project.owner_id.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { title, description, status, priority, assignee_id, tags, due_date } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (priority !== undefined) update.priority = priority;
    if (assignee_id !== undefined) update.assignee_id = assignee_id;
    if (tags !== undefined) update.tags = tags;
    if (due_date !== undefined) update.due_date = due_date;

    await Task.findByIdAndUpdate(req.params.id, { $set: update, updated_at: new Date() });
    logActivity(req.user.id, 'update', 'task', null, `Updated task #${req.params.id}`);
    res.json({ message: 'Task updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    const project = await Project.findById(task.project_id);
    if (!project || project.owner_id.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    await Task.findByIdAndDelete(req.params.id);
    await Project.findByIdAndUpdate(task.project_id, { $inc: { tasks_count: -1 }, updated_at: new Date() });
    logActivity(req.user.id, 'delete', 'task', null, `Deleted task #${req.params.id}`);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}
