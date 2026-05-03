import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOptionIndex: { type: Number, required: true },
});

const AttemptSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: { type: [AnswerSchema], default: [] },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  durationSeconds: { type: Number, default: 0 },
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', AttemptSchema);
export default Attempt;
