import Snippet from '../models/Snippet.js';
import SnippetLike from '../models/SnippetLike.js';
import Project from '../models/Project.js';
import { logActivity } from '../utils/activityLogger.js';

export async function listSnippets(req, res, next) {
  try {
    const { language, sort, search } = req.query;
    const filter = { visibility: 'public' };
    if (language && language !== 'all') filter.language = language;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const sortMap = { likes: { likes_count: -1 }, newest: { created_at: -1 }, updated: { updated_at: -1 } };
    const sortOpt = sortMap[sort] || sortMap.newest;

    const snippets = await Snippet.find(filter).populate('user_id', 'name username').sort(sortOpt).limit(50);
    res.json({
      snippets: snippets.map(s => ({
        ...s.toObject(), author_name: s.user_id?.name, author_username: s.user_id?.username,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createSnippet(req, res, next) {
  try {
    const { title, description, language, code, tags, visibility, project_id } = req.body;
    const snippet = await Snippet.create({
      user_id: req.user.id, title, description: description || '',
      language: language || 'javascript', code, tags: tags || [],
      visibility: visibility || 'public', project_id: project_id || null,
    });
    logActivity(req.user.id, 'create', 'snippet', snippet._id, `Created snippet "${title}"`);
    res.status(201).json({ id: snippet._id, message: 'Snippet created' });
  } catch (err) {
    next(err);
  }
}

export async function getSnippet(req, res, next) {
  try {
    const snippet = await Snippet.findById(req.params.id).populate('user_id', 'name username');
    if (!snippet) return res.status(404).json({ error: 'Not found' });
    if (snippet.visibility === 'private' && snippet.user_id._id.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Private snippet' });
    }

    let hasLiked = false;
    if (req.user) {
      const like = await SnippetLike.findOne({ snippet_id: snippet._id, user_id: req.user.id });
      hasLiked = !!like;
    }

    res.json({ snippet: { ...snippet.toObject(), author_name: snippet.user_id?.name, author_username: snippet.user_id?.username }, hasLiked });
  } catch (err) {
    next(err);
  }
}

export async function updateSnippet(req, res, next) {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Not found' });
    if (snippet.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { title, description, language, code, tags, visibility } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (language !== undefined) update.language = language;
    if (code !== undefined) update.code = code;
    if (tags !== undefined) update.tags = tags;
    if (visibility !== undefined) update.visibility = visibility;

    await Snippet.findByIdAndUpdate(req.params.id, { $set: update, updated_at: new Date() });
    logActivity(req.user.id, 'update', 'snippet', null, `Updated snippet #${req.params.id}`);
    res.json({ message: 'Snippet updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteSnippet(req, res, next) {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Not found' });
    if (snippet.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    await Snippet.findByIdAndDelete(req.params.id);
    logActivity(req.user.id, 'delete', 'snippet', null, `Deleted snippet #${req.params.id}`);
    res.json({ message: 'Snippet deleted' });
  } catch (err) {
    next(err);
  }
}

export async function likeSnippet(req, res, next) {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Not found' });
    const existing = await SnippetLike.findOne({ snippet_id: snippet._id, user_id: req.user.id });
    if (existing) return res.status(400).json({ error: 'Already liked' });

    await SnippetLike.create({ snippet_id: snippet._id, user_id: req.user.id });
    await Snippet.findByIdAndUpdate(snippet._id, { $inc: { likes_count: 1 } });
    res.json({ message: 'Liked' });
  } catch (err) {
    next(err);
  }
}

export async function unlikeSnippet(req, res, next) {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Not found' });
    const result = await SnippetLike.deleteOne({ snippet_id: snippet._id, user_id: req.user.id });
    if (result.deletedCount === 0) return res.status(400).json({ error: 'Not liked' });
    await Snippet.findByIdAndUpdate(snippet._id, { $inc: { likes_count: -1 } });
    res.json({ message: 'Unliked' });
  } catch (err) {
    next(err);
  }
}
