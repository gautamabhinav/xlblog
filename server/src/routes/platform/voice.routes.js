import { Router } from "express";
import { createVoiceRecording, listVoiceRecordings } from "../../controllers/platform/voice.controller.js";
import { isLoggedIn } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/recordings", isLoggedIn, listVoiceRecordings);
router.post("/recordings", isLoggedIn, createVoiceRecording);

export default router;
