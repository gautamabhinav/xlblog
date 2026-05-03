import { Router } from "express";

import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { uploadMultiple, uploadResponse, uploadSingle } from "../middlewares/multer.middleware.js";
import { ipLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.post(
  "/single",
  ipLimiter,
  isLoggedIn,
  uploadSingle("file", ["image", "pdf", "excel", "others"]),
  uploadResponse
);

router.post(
  "/multiple",
  ipLimiter,
  isLoggedIn,
  uploadMultiple("files", ["image", "pdf", "excel", "others"], 10),
  uploadResponse
);

export default router;

