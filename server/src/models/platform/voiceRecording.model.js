import mongoose from "mongoose";

const voiceRecordingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", index: true },
    attempt: { type: mongoose.Schema.Types.ObjectId, ref: "Attempt", index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", index: true },
    context: { type: String, enum: ["exam-answer", "voice-note", "search", "assistant", "lecture-note"], default: "voice-note", index: true },
    audio: {
      provider: { type: String, enum: ["cloudinary", "s3", "local"], default: "cloudinary" },
      publicId: { type: String, default: "" },
      secureUrl: { type: String, default: "" },
      duration: { type: Number, default: 0 },
      mimeType: { type: String, default: "audio/webm" },
    },
    transcript: { type: String, default: "", index: "text" },
    language: { type: String, default: "en-US" },
    ai: {
      noiseSuppression: { type: String, enum: ["pending", "not-requested", "processed"], default: "not-requested" },
      sentiment: { type: String, default: "" },
      summary: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

voiceRecordingSchema.index({ user: 1, createdAt: -1 });
voiceRecordingSchema.index({ context: 1, createdAt: -1 });

export default mongoose.model("VoiceRecording", voiceRecordingSchema);
