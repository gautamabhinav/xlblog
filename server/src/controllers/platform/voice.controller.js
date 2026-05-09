import asyncHandler from "../../middlewares/asyncHandler.middleware.js";
import VoiceRecording from "../../models/platform/voiceRecording.model.js";

export const createVoiceRecording = asyncHandler(async (req, res) => {
  const recording = await VoiceRecording.create({
    user: req.user._id,
    test: req.body.test,
    attempt: req.body.attempt,
    course: req.body.course,
    context: req.body.context || "voice-note",
    transcript: req.body.transcript || "",
    language: req.body.language || "en-US",
    audio: {
      provider: req.body.provider || "cloudinary",
      publicId: req.body.publicId || "",
      secureUrl: req.body.secureUrl || "",
      duration: req.body.duration || 0,
      mimeType: req.body.mimeType || "audio/webm",
    },
    ai: {
      noiseSuppression: req.body.noiseSuppression ? "pending" : "not-requested",
    },
  });

  res.status(201).json({
    success: true,
    message: "Voice recording metadata saved",
    recording,
    features: {
      speechToText: "Web Speech API client-side now, cloud STT-ready server contract",
      mediaRecorder: true,
      waveform: true,
      aiEnhancementPlaceholder: true,
    },
  });
});

export const listVoiceRecordings = asyncHandler(async (req, res) => {
  const recordings = await VoiceRecording.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit || 25), 100))
    .lean();

  res.json({ success: true, recordings });
});
