import asyncHandler from "../../middlewares/asyncHandler.middleware.js";
import AppError from "../../utils/AppError.js";
import VideoAsset from "../../models/platform/videoAsset.model.js";
import VideoProgress from "../../models/platform/videoProgress.model.js";
import VideoInteraction from "../../models/platform/videoInteraction.model.js";
import { buildPlaybackSources, createSignedPlaybackPlaceholder } from "../../services/platform/streaming.service.js";
import { enqueueJob } from "../../services/platform/queue.service.js";

export const listVideos = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 50);
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.course) filter.course = req.query.course;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) filter.$text = { $search: req.query.q };

  const [videos, total] = await Promise.all([
    VideoAsset.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    VideoAsset.countDocuments(filter),
  ]);

  res.json({
    success: true,
    videos,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const createVideo = asyncHandler(async (req, res) => {
  const { title, description, course, lectureId, thumbnailUrl, hlsUrl, dashUrl, mp4Url, duration, tags = [] } = req.body;

  if (!title) throw new AppError("Video title is required", 400);

  const video = await VideoAsset.create({
    title,
    description,
    course,
    lectureId,
    owner: req.user?._id,
    thumbnailUrl,
    duration,
    status: hlsUrl || mp4Url ? "ready" : "uploaded",
    playback: {
      hlsUrl,
      dashUrl,
      mp4Url,
      drmPolicy: req.body.drmPolicy || "none",
      watermarkEnabled: req.body.watermarkEnabled ?? true,
      antiDownloadEnabled: req.body.antiDownloadEnabled ?? false,
      lowLatencyEnabled: req.body.lowLatencyEnabled ?? false,
    },
    qualities: req.body.qualities || [],
    chapters: req.body.chapters || [],
    subtitles: req.body.subtitles || [],
    tags,
  });

  if (!hlsUrl && mp4Url) {
    await enqueueJob("video.transcode", { videoId: video._id, sourceUrl: mp4Url });
  }

  res.status(201).json({
    success: true,
    message: "Video asset created",
    video,
  });
});

export const getPlaybackManifest = asyncHandler(async (req, res) => {
  const video = await VideoAsset.findById(req.params.id).lean();
  if (!video) throw new AppError("Video not found", 404);

  const userId = req.user?._id?.toString() || "anonymous";
  const progress = req.user ? await VideoProgress.findOne({ user: req.user._id, video: video._id }).lean() : null;

  await VideoAsset.updateOne({ _id: video._id }, { $inc: { "analytics.views": 1 } });

  res.json({
    success: true,
    video: {
      _id: video._id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
    },
    playback: buildPlaybackSources(video),
    token: createSignedPlaybackPlaceholder({ videoId: video._id, userId }),
    progress,
    features: {
      hls: true,
      dashPlaceholder: true,
      lowLatencyHlsPlaceholder: true,
      drmReady: true,
      watermarkPlaceholder: video.playback?.watermarkEnabled,
      antiDownloadPlaceholder: video.playback?.antiDownloadEnabled,
      heatmapAnalyticsPlaceholder: true,
    },
  });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const { currentTime = 0, duration = 0, playbackRate = 1, deviceId = "" } = req.body;
  const percentComplete = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

  const progress = await VideoProgress.findOneAndUpdate(
    { user: req.user._id, video: req.params.id },
    {
      $set: {
        course: req.body.course,
        currentTime,
        duration,
        percentComplete,
        completed: percentComplete >= 95,
        playbackRate,
        deviceId,
        lastWatchedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, progress });
});

export const continueWatching = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 12), 30);
  const rows = await VideoProgress.find({ user: req.user._id, completed: false })
    .sort({ lastWatchedAt: -1 })
    .limit(limit)
    .populate("video")
    .lean();

  res.json({ success: true, items: rows });
});

export const addInteraction = asyncHandler(async (req, res) => {
  const { type, timestamp = 0, body = "", metadata = {} } = req.body;
  if (!type) throw new AppError("Interaction type is required", 400);

  const interaction = await VideoInteraction.create({
    user: req.user._id,
    video: req.params.id,
    type,
    timestamp,
    body,
    metadata,
  });

  res.status(201).json({ success: true, interaction });
});

export const getInteractions = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id, video: req.params.id };
  if (req.query.type) filter.type = req.query.type;

  const interactions = await VideoInteraction.find(filter).sort({ timestamp: 1 }).lean();
  res.json({ success: true, interactions });
});
