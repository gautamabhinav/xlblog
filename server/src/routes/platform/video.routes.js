import { Router } from "express";
import {
  addInteraction,
  continueWatching,
  createVideo,
  getInteractions,
  getPlaybackManifest,
  listVideos,
  updateProgress,
} from "../../controllers/platform/video.controller.js";
import { authorizeRoles, isLoggedIn } from "../../middlewares/auth.middleware.js";
import { cacheResponse } from "../../middlewares/platform/cache.middleware.js";
import { streamingTokenGuard } from "../../middlewares/platform/security.middleware.js";

const router = Router();

router.get("/", cacheResponse({ ttlSeconds: 45, namespace: "videos" }), listVideos);
router.post("/", isLoggedIn, authorizeRoles("ADMIN", "SUPERADMIN"), createVideo);
router.get("/continue-watching", isLoggedIn, continueWatching);
router.get("/:id/playback", isLoggedIn, streamingTokenGuard, getPlaybackManifest);
router.patch("/:id/progress", isLoggedIn, updateProgress);
router.post("/:id/interactions", isLoggedIn, addInteraction);
router.get("/:id/interactions", isLoggedIn, getInteractions);

export default router;
