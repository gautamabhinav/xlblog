import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [OptionSchema], required: true },
  correctAnswers: { type: [Number], default: [] },
  marks: { type: Number, enum: [1, 4], default: 1 },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  topic: { type: String, trim: true, default: 'General' },
  explanation: { type: String, trim: true },
  reviewStatus: {
    type: String,
    enum: ['VALID', 'NEEDS_REVIEW', 'REJECTED'],
    default: 'VALID',
  },
  reviewNotes: { type: [String], default: [] },
  source: {
    type: { type: String, enum: ['MANUAL', 'PDF', 'EXCEL', 'IMAGE', 'AI'], default: 'MANUAL' },
    fileName: String,
  },
});

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  durationSeconds: { type: Number, default: 300 }, // default 5 minutes
  totalQuestions: { type: Number, default: 0 },
  marksPerQuestion: { type: Number, enum: [1, 4], default: 1 },
  negativeMarkingEnabled: { type: Boolean, default: false },
  penaltyRatio: { type: Number, default: 0 },
  optionsCount: { type: Number, enum: [4, 5], default: 4 },
  pattern: {
    exam: { type: String, enum: ['CUSTOM', 'SSC', 'UPSC', 'BPSC'], default: 'CUSTOM' },
    scoringFormula: {
      type: String,
      default: 'score = correct * marks_per_question - (wrong / penalty_ratio)',
    },
    antiCheat: {
      fullscreenRequired: { type: Boolean, default: false },
      maxTabSwitches: { type: Number, default: 3 },
      autoSubmitOnViolation: { type: Boolean, default: false },
    },
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
  },
  questions: { type: [QuestionSchema], default: [] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

TestSchema.pre('validate', function(next) {
  this.totalQuestions = this.questions?.length || 0;

  this.questions = (this.questions || []).map((question) => {
    const correctFromOptions = (question.options || [])
      .map((option, index) => (option.isCorrect ? index : -1))
      .filter((index) => index >= 0);

    if (!question.correctAnswers?.length && correctFromOptions.length) {
      question.correctAnswers = correctFromOptions;
    }

    question.options = (question.options || []).map((option, index) => ({
      ...option,
      isCorrect: question.correctAnswers?.includes(index) || option.isCorrect,
    }));

    if (!question.marks) question.marks = this.marksPerQuestion;
    return question;
  });

  next();
});

const Test = mongoose.model('Test', TestSchema);
export default Test;
