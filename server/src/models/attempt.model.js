import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOptionIndex: { type: Number },
  selectedOptionIndexes: { type: [Number], default: [] },
  timeSpentSeconds: { type: Number, default: 0 },
  markedForReview: { type: Boolean, default: false },
});

const AttemptSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: { type: [AnswerSchema], default: [] },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  durationSeconds: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  percentile: { type: Number, default: 0 },
  rank: { type: Number, default: null },
  violations: {
    tabSwitches: { type: Number, default: 0 },
    fullscreenExits: { type: Number, default: 0 },
    autoSubmitted: { type: Boolean, default: false },
  },
  analytics: {
    perQuestion: { type: [mongoose.Schema.Types.Mixed], default: [] },
    topicWise: { type: [mongoose.Schema.Types.Mixed], default: [] },
    difficultyWise: { type: [mongoose.Schema.Types.Mixed], default: [] },
    weakAreas: { type: [String], default: [] },
    strongAreas: { type: [String], default: [] },
    heatmap: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', AttemptSchema);
export default Attempt;
