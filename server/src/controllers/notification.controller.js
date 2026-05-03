import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import Notification from '../models/notification.model.js';
import AppError from '../utils/AppError.js';
import { io } from '../utils/socket.js';

// Admin: create notification
export const createNotification = asyncHandler(async (req, res, next) => {
  const { title, message, link, targetRoles = [], targetUsers = [] } = req.body;
  if (!title || !message) return next(new AppError('Title and message required', 400));

  const n = await Notification.create({
    title,
    message,
    link,
    targetRoles: (targetRoles || []).map(r => String(r).toUpperCase()),
    targetUsers,
    createdBy: req.user?._id,
  });

  // Broadcast to connected clients (simple): send event 'newNotification' with payload
  try {
    // emit a lightweight payload to avoid leaking internal data
    // include targeting info so clients can decide whether to show the toast
    io.emit('newNotification', {
      _id: n._id,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
      type: n.type,
      link: n.link,
      targetRoles: n.targetRoles || [],
      targetUsers: (n.targetUsers || []).map(String),
    });
  } catch (e) {
    console.warn('Socket emit failed', e.message);
  }

  res.status(201).json({ success: true, notification: n });
});

// User: get notifications (with unread count)
export const getNotificationsForUser = asyncHandler(async (req, res) => {
  const user = req.user;
  // Simple policy: return notifications where targetRoles empty or includes user.role OR targetUsers contains user
  const q = {
    $or: [
      { targetRoles: { $exists: true, $size: 0 } },
      { targetRoles: { $in: [String(user.role).toUpperCase()] } },
      { targetUsers: user._id },
    ],
  };

  // populate createdBy to show who triggered the notification
  const items = await Notification.find(q).sort({ createdAt: -1 }).populate('createdBy', 'name role avatar').lean().exec();
  const unreadCount = items.filter((it) => !(it.readBy || []).some((r) => String(r.user) === String(user._id))).length;

  res.json({ notifications: items, unreadCount });
});

// User: mark a notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const n = await Notification.findById(id);
  if (!n) return res.status(404).json({ message: 'Not found' });

  if (!(n.readBy || []).some((r) => String(r.user) === String(userId))) {
    n.readBy.push({ user: userId, readAt: new Date() });
    await n.save();
  }

  res.json({ success: true });
});

// Admin: list all notifications
export const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find().sort({ createdAt: -1 }).lean().exec();
  res.json({ notifications: items });
});
