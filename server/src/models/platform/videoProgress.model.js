import mongoose from "mongoose";

const videoProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "VideoAsset", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", index: true },
    currentTime: { type: Number, default: 0, min: 0 },
    duration: { type: Number, default: 0, min: 0 },
    percentComplete: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false, index: true },
    playbackRate: { type: Number, default: 1 },
    deviceId: { type: String, default: "", index: true },
    lastWatchedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

videoProgressSchema.index({ user: 1, video: 1 }, { unique: true });
videoProgressSchema.index({ user: 1, lastWatchedAt: -1 });

export default mongoose.model("VideoProgress", videoProgressSchema);
