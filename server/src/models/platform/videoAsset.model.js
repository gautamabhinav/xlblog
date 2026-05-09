import mongoose from "mongoose";

const qualitySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, enum: ["240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "source"] },
    bitrate: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    url: { type: String, required: true },
    codec: { type: String, default: "h264" },
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    startTime: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const subtitleSchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    kind: { type: String, enum: ["subtitles", "captions", "descriptions"], default: "subtitles" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const videoAssetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, default: "", index: "text" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", index: true },
    lectureId: { type: mongoose.Schema.Types.ObjectId, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    thumbnailUrl: { type: String, default: "" },
    previewThumbnailUrl: { type: String, default: "" },
    duration: { type: Number, default: 0, min: 0 },
    provider: { type: String, enum: ["cloudinary", "mux", "s3", "external"], default: "cloudinary" },
    status: {
      type: String,
      enum: ["draft", "uploaded", "queued", "transcoding", "ready", "failed", "archived"],
      default: "uploaded",
      index: true,
    },
    playback: {
      hlsUrl: { type: String, default: "" },
      dashUrl: { type: String, default: "" },
      mp4Url: { type: String, default: "" },
      drmPolicy: { type: String, enum: ["none", "signed-url", "widevine-ready", "fairplay-ready"], default: "none" },
      watermarkEnabled: { type: Boolean, default: true },
      antiDownloadEnabled: { type: Boolean, default: false },
      lowLatencyEnabled: { type: Boolean, default: false },
    },
    qualities: [qualitySchema],
    chapters: [chapterSchema],
    subtitles: [subtitleSchema],
    tags: [{ type: String, trim: true, lowercase: true, index: true }],
    analytics: {
      views: { type: Number, default: 0 },
      totalWatchSeconds: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
    },
    ai: {
      transcriptUrl: { type: String, default: "" },
      summary: { type: String, default: "" },
      recommendationVectorId: { type: String, default: "" },
      moderationStatus: { type: String, enum: ["pending", "approved", "flagged"], default: "pending" },
    },
  },
  { timestamps: true }
);

videoAssetSchema.index({ course: 1, lectureId: 1 }, { sparse: true });
videoAssetSchema.index({ status: 1, updatedAt: -1 });
videoAssetSchema.index({ tags: 1, createdAt: -1 });

export default mongoose.model("VideoAsset", videoAssetSchema);
