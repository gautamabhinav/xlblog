import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import Test from '../models/test.model.js';
import Attempt from '../models/attempt.model.js';
import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';
import { parsePdfToQuestions } from '../services/pdf.service.js';
import { PDFDocument } from 'pdf-lib';
import upload from '../middlewares/multer.middleware.js';
import fs from 'fs/promises';


// Create a new test (admin only ideally)
export const createTest = asyncHandler(async (req, res, next) => {
  const { title, description, durationSeconds, questions } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return next(new AppError('Missing title or questions', 400));
  }

  const test = await Test.create({ title, description, durationSeconds, questions, author: req.user?._id });
  res.status(201).json({ success: true, test });
});

export const updateTest = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { title, description, durationSeconds, questions } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid test ID', 400));
  }

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return next(new AppError('Missing title or questions', 400));
  }

  const cleanedQuestions = questions.map((q, qi) => {
    if (!String(q.text || '').trim() || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) {
      throw new AppError(`Question ${qi + 1} must have text and 2-4 options`, 400);
    }

    const cleanedOptions = q.options.map((o) => ({
      text: String(o.text || '').trim(),
      isCorrect: !!o.isCorrect,
    }));

    if (cleanedOptions.some((o) => !o.text)) {
      throw new AppError(`Question ${qi + 1} has an empty option`, 400);
    }

    const correctCount = cleanedOptions.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new AppError(`Question ${qi + 1} must have exactly one correct option`, 400);
    }

    return { text: String(q.text).trim(), options: cleanedOptions };
  });

  const test = await Test.findByIdAndUpdate(
    id,
    {
      title: String(title).trim(),
      description,
      durationSeconds,
      questions: cleanedQuestions,
    },
    { new: true, runValidators: true }
  );

  if (!test) return next(new AppError('Test not found', 404));

  res.json({ success: true, test });
});

export const listTests = asyncHandler(async (req, res, next) => {
  const tests = await Test.find().select('title description durationSeconds createdAt');
  res.json({ success: true, tests });
});

export const getTest = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid test ID', 400));
  }

  const test = await Test.findById(id).lean();
  if (!test) return next(new AppError('Test not found', 404));

  // remove isCorrect flags before sending to client
  test.questions = test.questions.map((q) => ({
    _id: q._id,
    text: q.text,
    options: q.options.map((o) => ({ text: o.text })),
  }));
  res.json({ success: true, test });
});

// Submit attempt and return score + simple analysis
export const submitAttempt = asyncHandler(async (req, res, next) => {
  // Accept testId either in request body or URL param (/tests/:id/submit)
  const { testId: bodyTestId, answers, durationSeconds } = req.body;
  const testId = bodyTestId || req.params.id;

  if (!testId || !answers) return next(new AppError('Missing testId or answers', 400));

  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return next(new AppError('Invalid test ID', 400));
  }

  const test = await Test.findById(testId);
  if (!test) return next(new AppError('Test not found', 404));

  let score = 0;
  const perQuestion = [];
  test.questions.forEach((q, qi) => {
    const provided = answers.find((a) => String(a.questionId) === String(q._id));
    const correctIndex = q.options.findIndex((o) => o.isCorrect);
    let got = 0;
    let selected = null;
    if (provided) {
      selected = provided.selectedOptionIndex;
      if (selected === correctIndex) { got = 1; score += 1; }
    }
    perQuestion.push({ questionId: q._id, correctIndex, selected, got, text: q.text });
  });

  const attempt = await Attempt.create({ test: test._id, user: req.user?._id, answers, score, maxScore: test.questions.length, durationSeconds });

  // Basic analysis: percent, time per question, list of wrong questions
  const percent = Math.round((score / Math.max(1, test.questions.length)) * 100);
  const wrong = perQuestion.filter((p) => p.got === 0);

  res.json({ success: true, attempt, analysis: { score, maxScore: test.questions.length, percent, wrong, perQuestion } });
});

export const getAttempt = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid attempt ID', 400));
  }

  const attempt = await Attempt.findById(id).populate('test');
  if (!attempt) return next(new AppError('Attempt not found', 404));
  res.json({ success: true, attempt });
});

// List attempts (optionally filter by test id)
export const listAttempts = asyncHandler(async (req, res, next) => {
  const { testId } = req.query;
  const filter = {};
  if (testId) {
    if (!mongoose.Types.ObjectId.isValid(testId)) return next(new AppError('Invalid testId', 400));
    filter.test = testId;
  }

  const attempts = await Attempt.find(filter).populate('test').populate('user').sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, attempts });
});

// List attempts for the logged-in user
export const listMyAttempts = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) return next(new AppError('Not authenticated', 401));
  const { testId } = req.query;
  const filter = { user: req.user._id };
  if (testId) {
    if (!mongoose.Types.ObjectId.isValid(testId)) return next(new AppError('Invalid testId', 400));
    filter.test = testId;
  }
  const attempts = await Attempt.find(filter).populate('test').sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, attempts });
});

// Leaderboard for a test: best attempt per user, sorted by score desc then duration asc
export const getLeaderboard = asyncHandler(async (req, res, next) => {
  const testId = req.params.id;
  const limit = parseInt(req.query.limit || '20', 10);
  if (!mongoose.Types.ObjectId.isValid(testId)) return next(new AppError('Invalid test ID', 400));

  // aggregate: for each user, get their best attempt for this test
  const pipeline = [
    { $match: { test: new mongoose.Types.ObjectId(testId) } },
    { $group: {
        _id: '$user',
        bestScore: { $max: '$score' },
        bestDuration: { $min: '$durationSeconds' },
        attemptId: { $first: '$_id' },
        lastAttemptAt: { $max: '$createdAt' }
    }},
    // join user data
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $project: {
        user: { _id: '$user._id', name: '$user.name', email: '$user.email' },
        bestScore: 1,
        bestDuration: 1,
        lastAttemptAt: 1,
    }},
    { $sort: { bestScore: -1, bestDuration: 1, lastAttemptAt: 1 } },
    { $limit: limit }
  ];

  const rows = await Attempt.aggregate(pipeline);
  res.json({ success: true, leaderboard: rows });
});

// Upload PDF, parse into MCQs and create test (Admin only)
export const uploadPdfAndCreateTest = asyncHandler(async (req, res, next) => {
  // multer middleware should attach file; our multer keeps many files on disk or in memory depending on ext
  const file = req.file;
  if (!file) return next(new AppError('No file uploaded', 400));

  // Only accept pdf
  const originalName = file.originalname || '';
  const ext = originalName.split('.').pop().toLowerCase();
  if (ext !== 'pdf' && file.mimetype !== 'application/pdf') return next(new AppError('Only PDF files are allowed', 400));

  // Acquire buffer: multer may have stored file.buffer for in-memory or file.path for disk
  const buffer = file.buffer;

  if (!buffer) {
    return next(new AppError('File buffer missing (multer issue)', 500));
  }

  if (!buffer) return next(new AppError('Unable to read uploaded file', 500));

  // parse the PDF into questions
  let parsed;
  try {
  const debug = req.query && (req.query.debug === '1' || req.query.debug === 'true');
  const useOcr = (req.body && (req.body.useOcr === '1' || req.body.useOcr === 'true')) || (req.query && (req.query.useOcr === '1' || req.query.useOcr === 'true')) || false;
  parsed = await parsePdfToQuestions(buffer, originalName, { debug, useOcr });
  } catch (err) {
    console.warn('PDF parsing failed', err.message || err);
    // Return structured response so client can inspect raw text/errors
    return res.status(200).json({ success: false, message: 'Failed to parse PDF into questions', error: err.message || String(err) });
  }

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    // If admin explicitly requested upload+create, we still create a placeholder test so the flow does not break.
    // The created test contains a single editable placeholder question; the response includes a warning and debug info.
    const placeholderQuestion = {
      text: 'Parsed PDF did not contain detectable questions. Please edit this question.',
      options: [
        { text: 'Option A (edit)', isCorrect: true },
        { text: 'Option B (edit)', isCorrect: false },
      ],
    };
    const newTest = await Test.create({ title: parsed?.title || originalName, description: `Imported from ${originalName} (parsing produced no questions)`, questions: [placeholderQuestion], author: req.user?._id });
  return res.status(201).json({ success: true, test: newTest, warning: 'No questions could be extracted from PDF; a placeholder test was created. Please edit the test to add real questions.', debug: parsed?._debug || null, usedOcr: !!useOcr });
  }

  // create test document
  const newTest = await Test.create({ title: parsed.title || originalName, description: `Imported from ${originalName}`, questions: parsed.questions, author: req.user?._id });

  res.status(201).json({ success: true, test: newTest });
});

// Merge multiple uploaded PDFs into one, then parse (no DB save)
export const mergePdfsAndParse = asyncHandler(async (req, res, next) => {
  // expect multiple files under field 'pdfs'
  const files = req.files;
  if (!files || files.length === 0) return next(new AppError('No files uploaded', 400));

  try {
    const mergedPdf = await PDFDocument.create();
    for (const f of files) {
      let buf = f.buffer;
      if (!buf && f.path) {
        buf = await fs.readFile(f.path);
      }
      if (!buf) continue;
      const donor = await PDFDocument.load(buf);
      const copied = await mergedPdf.copyPages(donor, donor.getPageIndices());
      copied.forEach((p) => mergedPdf.addPage(p));
    }

    const mergedBytes = await mergedPdf.save();
    // parse merged buffer
    const debug = req.query && (req.query.debug === '1' || req.query.debug === 'true');
    const useOcr = (req.body && (req.body.useOcr === '1' || req.body.useOcr === 'true')) || (req.query && (req.query.useOcr === '1' || req.query.useOcr === 'true')) || false;
    const parsed = await parsePdfToQuestions(Buffer.from(mergedBytes), 'merged.pdf', { debug, useOcr });
    res.json({ success: true, parsed, usedOcr: !!useOcr });
  } catch (err) {
    console.error('Merge+parse failed', err);
    return next(new AppError('Failed to merge or parse PDFs', 500));
  }
});

// Parse PDF and return parsed questions only (no DB save)
// export const parsePdfOnly = asyncHandler(async (req, res, next) => {
//   const file = req.file;
//   if (!file) return next(new AppError('No file uploaded', 400));

//   const originalName = file.originalname || '';
//   const ext = originalName.split('.').pop().toLowerCase();
//   if (ext !== 'pdf' && file.mimetype !== 'application/pdf') return next(new AppError('Only PDF files are allowed', 400));

//   let buffer = file.buffer;
//   if (!buffer && file.path) {
//     // read file into buffer
//     buffer = await import('fs').then(fs => fs.promises.readFile(file.path));
//   }

//   if (!buffer) return next(new AppError('Unable to read uploaded file', 500));

//   let parsed;
//   try {
//     const debug = req.query && (req.query.debug === '1' || req.query.debug === 'true');
//     const useOcr = (req.body && (req.body.useOcr === '1' || req.body.useOcr === 'true')) || (req.query && (req.query.useOcr === '1' || req.query.useOcr === 'true')) || false;
//     parsed = await parsePdfToQuestions(buffer, originalName, { debug, useOcr });
//   } catch (err) {
//     console.warn('PDF parsing failed', err.message || err);
//     return res.status(200).json({ success: false, message: 'Failed to parse PDF into questions', error: err.message || String(err) });
//   }
//   if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
//     return res.status(200).json({ success: false, message: 'No questions could be extracted from PDF', parsed: parsed || { title: originalName, questions: [] }, debug: parsed?._debug || null, usedOcr: !!useOcr });
//   }

//   res.json({ success: true, parsed });
// });

export const parsePdfOnly = asyncHandler(async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return next(new AppError('No file uploaded', 400));
  }

  const buffer = file.buffer;
  if (!buffer) {
    return next(new AppError('Buffer not found', 500));
  }

  try {
    const debug = req.query?.debug === '1' || req.query?.debug === 'true';
    const useOcr =
      req.body?.useOcr === '1' ||
      req.body?.useOcr === 'true' ||
      req.query?.useOcr === '1' ||
      req.query?.useOcr === 'true';

    const parsed = await parsePdfToQuestions(buffer, file.originalname, {
      debug,
      useOcr,
    });

    if (!parsed?.questions?.length) {
      return res.status(200).json({
        success: false,
        message: 'No questions found',
        parsed,
      });
    }

    res.json({ success: true, parsed });

  } catch (err) {
    console.error('PARSE ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Parsing failed',
      error: err.message,
    });
  }
});

// Import parsed JSON (from client preview) to create Test document
export const importParsedTest = asyncHandler(async (req, res, next) => {
  const { title, description, durationSeconds, questions } = req.body;
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return next(new AppError('Missing title or questions', 400));
  }

  // Basic validation of questions array shape
  for (const q of questions) {
    if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
      return next(new AppError('Each question must have text and at least two options', 400));
    }
    // ensure options have text and isCorrect boolean
    q.options = q.options.map(o => ({ text: String(o.text || '').trim(), isCorrect: !!o.isCorrect }));
  }

  const test = await Test.create({ title, description, durationSeconds, questions, author: req.user?._id });
  res.status(201).json({ success: true, test });
});
