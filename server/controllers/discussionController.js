import Discussion from '../models/Discussion.js';
import DiscussionReply from '../models/DiscussionReply.js';
import { logActivity } from '../utils/activityLogger.js';

export async function listDiscussions(req, res, next) {
  try {
    const { projectId, tag, sort } = req.query;
    const filter = {};
    if (projectId) filter.project_id = projectId;
    if (tag && tag !== 'all') filter.tags = tag;
    const sortMap = { newest: { created_at: -1 }, replies: { replies_count: -1 }, updated: { updated_at: -1 } };
    const sortOpt = sortMap[sort] || sortMap.newest;

    const discussions = await Discussion.find(filter)
      .populate('author_id', 'name username')
      .sort(sortOpt)
      .limit(50);

    res.json({
      discussions: discussions.map(d => ({
        ...d.toObject(), author_name: d.author_id?.name, author_username: d.author_id?.username,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createDiscussion(req, res, next) {
  try {
    const { project_id, title, content, tags } = req.body;
    const discussion = await Discussion.create({
      project_id, author_id: req.user.id, title, content: content || '',
      tags: tags || [],
    });
    logActivity(req.user.id, 'create', 'discussion', discussion._id, `Created discussion "${title}"`);
    res.status(201).json({ id: discussion._id, message: 'Discussion created' });
  } catch (err) {
    next(err);
  }
}

export async function getDiscussion(req, res, next) {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author_id', 'name username')
      .populate('project_id', 'name');
    if (!discussion) return res.status(404).json({ error: 'Not found' });

    const replies = await DiscussionReply.find({ discussion_id: discussion._id })
      .populate('author_id', 'name username')
      .sort({ created_at: 1 });

    res.json({
      discussion: {
        ...discussion.toObject(), author_name: discussion.author_id?.name,
        author_username: discussion.author_id?.username, tags: discussion.tags || [],
      },
      replies: replies.map(r => ({
        ...r.toObject(), author_name: r.author_id?.name, author_username: r.author_id?.username,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function addReply(req, res, next) {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    const reply = await DiscussionReply.create({
      discussion_id: discussion._id, author_id: req.user.id, content,
    });
    await Discussion.findByIdAndUpdate(discussion._id, { $inc: { replies_count: 1 }, updated_at: new Date() });
    logActivity(req.user.id, 'reply', 'discussion', discussion._id, `Replied to discussion #${req.params.id}`);
    res.status(201).json({ id: reply._id, message: 'Reply added' });
  } catch (err) {
    next(err);
  }
}
