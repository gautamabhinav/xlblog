import asyncHandler from "../../middlewares/asyncHandler.middleware.js";
import { cacheStatus } from "../../services/platform/cache.service.js";
import { getQueueSnapshot, queueArchitecture } from "../../services/platform/queue.service.js";

export const getPlatformArchitecture = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    architecture: {
      style: "modular-monolith with microservice-ready boundaries",
      scaleTargets: ["horizontal API replicas", "Redis distributed cache", "CDN video edge delivery", "queue workers", "MongoDB sharding-ready collections"],
      video: ["HLS first", "DASH placeholder", "LL-HLS placeholder", "DRM-ready policy", "Cloudinary/FFmpeg transcode pipeline"],
      realtime: ["Socket.IO gateway", "Redis adapter-ready", "presence rooms", "live quiz events", "notifications"],
      ai: ["AI tutor", "summaries", "recommendations", "moderation", "semantic search placeholders"],
    },
    cache: cacheStatus(),
    queue: getQueueSnapshot(),
    queueArchitecture,
  });
});
