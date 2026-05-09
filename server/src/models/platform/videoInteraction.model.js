import mongoose from "mongoose";

const videoInteractionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "VideoAsset", required: true, index: true },
    type: { type: String, enum: ["bookmark", "note", "quiz-response", "reaction"], required: true, index: true },
    timestamp: { type: Number, default: 0, min: 0, index: true },
    body: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

videoInteractionSchema.index({ user: 1, video: 1, type: 1, timestamp: 1 });

export default mongoose.model("VideoInteraction", videoInteractionSchema);
