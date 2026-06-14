import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectCollaborator from '../models/ProjectCollaborator.js';
import Snippet from '../models/Snippet.js';
import ActivityLog from '../models/ActivityLog.js';
import Follow from '../models/Follow.js';
import { logActivity } from '../utils/activityLogger.js';

export async function getProfile(req, res, next) {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const projects = await ProjectCollaborator.aggregate([
      { $match: { user_id: user._id } },
      { $lookup: { from: 'projects', localField: 'project_id', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
      { $match: { 'project.visibility': 'public' } },
      { $sort: { 'project.updated_at': -1 } },
      { $limit: 6 },
      { $replaceRoot: { newRoot: '$project' } },
    ]);

    const snippets = await Snippet.find({ user_id: user._id, visibility: 'public' })
      .select('title language likes_count created_at')
      .sort({ created_at: -1 })
      .limit(10);

    const activity = await ActivityLog.find({ user_id: user._id })
      .sort({ created_at: -1 })
      .limit(20);

    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({ follower_id: req.user.id, following_id: user._id });
      isFollowing = !!follow;
    }

    res.json({
      user: { ...user.toObject(), skills: user.skills || [] },
      projects,
      snippets,
      activity,
      isFollowing,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, bio, location, website, primary_language, skills } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (location !== undefined) update.location = location;
    if (website !== undefined) update.website = website;
    if (primary_language !== undefined) update.primary_language = primary_language;
    if (skills !== undefined) update.skills = skills;

    await User.findByIdAndUpdate(req.user.id, { $set: update });
    logActivity(req.user.id, 'update', 'profile', null, 'Updated profile');
    res.json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
}

export async function followUser(req, res, next) {
  try {
    const { userId } = req.params;
    await Follow.create({ follower_id: req.user.id, following_id: userId });
    await User.findByIdAndUpdate(userId, { $inc: { followers_count: 1 } });
    await User.findByIdAndUpdate(req.user.id, { $inc: { following_count: 1 } });
    logActivity(req.user.id, 'follow', 'user', userId, 'Started following user');
    res.json({ message: 'Following' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Already following' });
    next(err);
  }
}

export async function unfollowUser(req, res, next) {
  try {
    const { userId } = req.params;
    const result = await Follow.deleteOne({ follower_id: req.user.id, following_id: userId });
    if (result.deletedCount === 0) return res.status(400).json({ error: 'Not following' });
    await User.findByIdAndUpdate(userId, { $inc: { followers_count: -1 } });
    await User.findByIdAndUpdate(req.user.id, { $inc: { following_count: -1 } });
    logActivity(req.user.id, 'unfollow', 'user', userId, 'Unfollowed user');
    res.json({ message: 'Unfollowed' });
  } catch (err) {
    next(err);
  }
}
