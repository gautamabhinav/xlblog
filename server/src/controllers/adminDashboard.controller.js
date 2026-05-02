import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import Attempt from '../models/attempt.model.js';
import Post from '../models/blog.model.js';
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';
import mongoose from 'mongoose';

// GET /api/v1/admin/dashboard-full
// Return paginated users with activity counts only to keep payload small
export const getAllUsersDashboard = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const skip = Math.max(parseInt(req.query.skip || '0', 10), 0);

  // fetch users page
  const users = await User.find().select('-password -__v').sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

  // For each user, return counts only (cheap)
  const payload = await Promise.all(users.map(async (u) => {
    const uid = u._id;
    const [attemptsCount, postsCount, likesCount, commentsCount] = await Promise.all([
      Attempt.countDocuments({ user: uid }),
      Post.countDocuments({ createdBy: String(uid) }),
      Like.countDocuments({ user: uid }),
      Comment.countDocuments({ user: uid }),
    ]);

    return {
      user: u,
      attemptsCount,
      postsCount,
      likesCount,
      commentsCount,
    };
  }));

  res.json({ success: true, users: payload, meta: { count: payload.length, skip, limit } });
});

// GET /api/v1/admin/user/:id/activity
// Returns a single user's activity with pagination for attempts/posts/comments
export const getUserActivity = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }

  const attemptLimit = Math.min(parseInt(req.query.attemptLimit || '20', 10), 200);
  const attemptSkip = Math.max(parseInt(req.query.attemptSkip || '0', 10), 0);
  const postsLimit = Math.min(parseInt(req.query.postsLimit || '10', 10), 200);
  const postsSkip = Math.max(parseInt(req.query.postsSkip || '0', 10), 0);
  const commentsLimit = Math.min(parseInt(req.query.commentsLimit || '10', 10), 200);
  const commentsSkip = Math.max(parseInt(req.query.commentsSkip || '0', 10), 0);

  const user = await User.findById(userId).select('-password -__v').lean();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Fetch paginated activity
  const [attempts, attemptsCount, posts, postsCount, likes, likesCount, comments, commentsCount] = await Promise.all([
    Attempt.find({ user: userId }).populate('test', 'title').sort({ createdAt: -1 }).skip(attemptSkip).limit(attemptLimit).lean(),
    Attempt.countDocuments({ user: userId }),
    Post.find({ createdBy: String(userId) }).sort({ createdAt: -1 }).skip(postsSkip).limit(postsLimit).lean(),
    Post.countDocuments({ createdBy: String(userId) }),
    Like.find({ user: userId }).lean(),
    Like.countDocuments({ user: userId }),
    Comment.find({ user: userId }).sort({ createdAt: -1 }).skip(commentsSkip).limit(commentsLimit).lean(),
    Comment.countDocuments({ user: userId }),
  ]);

  // liked posts resolution (only titles)
  const likedPostIds = (likes || []).map(l => l.blogid).filter(Boolean);
  const likedPosts = likedPostIds.length > 0 ? await Post.find({ _id: { $in: likedPostIds } }).select('title createdAt').lean() : [];

  res.json({
    success: true,
    user,
    attempts: { items: attempts, total: attemptsCount, skip: attemptSkip, limit: attemptLimit },
    posts: { items: posts, total: postsCount, skip: postsSkip, limit: postsLimit },
    likes: { items: likedPosts, total: likesCount },
    comments: { items: comments, total: commentsCount, skip: commentsSkip, limit: commentsLimit },
  });
});

export default { getAllUsersDashboard, getUserActivity };
