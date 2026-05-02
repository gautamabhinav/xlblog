import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import Attempt from '../models/attempt.model.js';
import Post from '../models/blog.model.js';
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';
import Notification from '../models/notification.model.js';
import mongoose from 'mongoose';

// GET /api/dashboard
export const getUserDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

  // pagination/limits from query
  const attemptLimit = Math.min(parseInt(req.query.attemptLimit || '200', 10), 1000);
  const postsLimit = Math.min(parseInt(req.query.postsLimit || '50', 10), 500);
  const commentsLimit = Math.min(parseInt(req.query.commentsLimit || '200', 10), 1000);

  // Build notification query similar to notification.controller policy
  const notifQuery = {
    $or: [
      { targetRoles: { $exists: true, $size: 0 } },
      { targetRoles: { $in: [String(req.user.role).toUpperCase()] } },
      { targetUsers: userId },
    ],
  };

  // Fetch independent pieces in parallel
  const [userDoc, attempts, postsCreated, likes, comments, notifications] = await Promise.all([
    User.findById(userId).select('-password -__v').lean(),
    Attempt.find({ user: userId }).populate('test', 'title').sort({ createdAt: -1 }).limit(attemptLimit).lean(),
    Post.find({ createdBy: String(userId) }).sort({ createdAt: -1 }).limit(postsLimit).lean(),
    Like.find({ user: userId }).lean(),
    Comment.find({ user: userId }).sort({ createdAt: -1 }).limit(commentsLimit).lean(),
    Notification.find(notifQuery).sort({ createdAt: -1 }).lean(),
  ]);

  // Resolve liked posts ids -> fetch posts
  const likedPostIds = (likes || []).map((l) => l.blogid).filter(Boolean);
  const likedPosts = likedPostIds.length > 0 ? await Post.find({ _id: { $in: likedPostIds } }).lean() : [];

  // Analytics: overall avg score, per-test aggregates (avg, best, attemptsCount)
  const aggPipeline = [
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$test', avgScore: { $avg: '$score' }, bestScore: { $max: '$score' }, attempts: { $sum: 1 } } },
    { $lookup: { from: 'tests', localField: '_id', foreignField: '_id', as: 'test' } },
    { $unwind: { path: '$test', preserveNullAndEmptyArrays: true } },
    { $project: { testId: '$_id', testTitle: '$test.title', avgScore: 1, bestScore: 1, attempts: 1 } },
    { $sort: { avgScore: -1 } },
  ];

  const perTest = await Attempt.aggregate(aggPipeline);

  const overallAvg = attempts && attempts.length > 0 ? (attempts.reduce((s, a) => s + (Number(a.score) || 0), 0) / attempts.length) : 0;

  const analytics = {
    overallAvgScore: Math.round((overallAvg || 0) * 100) / 100,
    perTest: perTest || [],
    attemptsCount: attempts.length || 0,
  };

  // Build structured response
  res.json({
    success: true,
    user: userDoc || null,
    testsAttempted: attempts || [],
    postsCreated: postsCreated || [],
    likedPosts: likedPosts || [],
    comments: comments || [],
    notifications: notifications || [],
    analytics,
  });
});

export default { getUserDashboard };
