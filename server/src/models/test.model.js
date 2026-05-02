import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  // store isCorrect on the server only
  isCorrect: { type: Boolean, default: false },
});

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [OptionSchema], required: true },
});

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  durationSeconds: { type: Number, default: 300 }, // default 5 minutes
  questions: { type: [QuestionSchema], default: [] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Test = mongoose.model('Test', TestSchema);
export default Test;
