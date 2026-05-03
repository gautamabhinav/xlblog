import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import Test from '../models/test.model.js';
import Attempt from '../models/attempt.model.js';
import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';
import { parsePdfToQuestions } from '../services/pdf.service.js';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { calculateRankAndPercentile, calculateScore } from '../services/scoring.service.js';
import { detectDuplicateQuestions, ingestExamFile } from '../services/examIngestion.service.js';

const normalizeQuestion = (question, config = {}) => {
  const correctAnswers = Array.isArray(question.correctAnswers) && question.correctAnswers.length
    ? question.correctAnswers.map(Number)
    : (question.options || [])
        .map((option, index) => (option.isCorrect ? index : -1))
        .filter((index) => index >= 0);

  return {
    text: String(question.text || question.question || "").trim(),
    options: (question.options || []).map((option, index) => ({
      text: String(option.text || option || "").trim(),
      isCorrect: correctAnswers.includes(index),
    })),
    correctAnswers,
    marks: Number(question.marks || config.marksPerQuestion || 1),
    difficulty: String(question.difficulty || "MEDIUM").toUpperCase(),
    topic: question.topic || "General",
    explanation: question.explanation,
    reviewStatus: question.reviewStatus || "VALID",
    reviewNotes: question.reviewNotes || [],
    source: question.source || { type: "MANUAL" },
  };
};

const validateQuestion = (question, index, optionsCount) => {
  if (!question.text) throw new AppError(`Question ${index + 1} text is required`, 400);
  if (question.options.length < 4 || question.options.length > 5) {
    throw new AppError(`Question ${index + 1} must have 4 or 5 options`, 400);
  }
  if (optionsCount && question.options.length !== optionsCount) {
    throw new AppError(`Question ${index + 1} must have exactly ${optionsCount} options`, 400);
  }
  if (question.options.some((option) => !option.text)) {
    throw new AppError(`Question ${index + 1} has an empty option`, 400);
  }
  if (!question.correctAnswers.length) {
    throw new AppError(`Question ${index + 1} must have at least one correct answer`, 400);
  }
};

const buildTestPayload = (body, userId) => {
  const marksPerQuestion = Number(body.marksPerQuestion || body.marks_per_question || 1);
  const optionsCount = Number(body.optionsCount || body.options_count || 4);
  const negativeMarkingEnabled = Boolean(body.negativeMarkingEnabled ?? body.negative_marking_enabled);
  const penaltyRatio = negativeMarkingEnabled ? Number(body.penaltyRatio || body.negativeRatio || body.negative_ratio || 4) : 0;
  const questions = (body.questions || []).map((question) =>
    normalizeQuestion(question, { marksPerQuestion })
  );

  questions.forEach((question, index) => validateQuestion(question, index, optionsCount));

  return {
    title: String(body.title || "").trim(),
    description: body.description,
    durationSeconds: Number(body.durationSeconds || body.duration_seconds || 300),
    marksPerQuestion,
    negativeMarkingEnabled,
    penaltyRatio,
    optionsCount,
    status: body.status || "DRAFT",
    pattern: {
      exam: body.examPattern || body.pattern?.exam || "CUSTOM",
      ...(body.pattern || {}),
      antiCheat: {
        fullscreenRequired: Boolean(body.fullscreenRequired || body.pattern?.antiCheat?.fullscreenRequired),
        maxTabSwitches: Number(body.maxTabSwitches || body.pattern?.antiCheat?.maxTabSwitches || 3),
        autoSubmitOnViolation: Boolean(body.autoSubmitOnViolation || body.pattern?.antiCheat?.autoSubmitOnViolation),
      },
    },
    questions,
    author: userId,
  };
};


// Create a new test (admin only ideally)
export const createTest = asyncHandler(async (req, res, next) => {
  const payload = buildTestPayload(req.body, req.user?._id);

  if (!payload.title || !payload.questions.length) {
    return next(new AppError('Missing title or questions', 400));
  }

  const duplicates = detectDuplicateQuestions(payload.questions);
  const test = await Test.create(payload);
  res.status(201).json({ success: true, test, duplicates });
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
  const tests = await Test.find().select('title description durationSeconds totalQuestions marksPerQuestion negativeMarkingEnabled penaltyRatio optionsCount status pattern createdAt');
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
    marks: q.marks,
    difficulty: q.difficulty,
    topic: q.topic,
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

  const result = calculateScore({
    test,
    answers,
    durationSeconds,
    violations: req.body.violations || {},
  });

  const attempt = await Attempt.create({
    test: test._id,
    user: req.user?._id,
    answers,
    score: result.score,
    maxScore: result.maxScore,
    durationSeconds,
    correctCount: result.correctCount,
    wrongCount: result.wrongCount,
    skippedCount: result.skippedCount,
    accuracy: result.accuracy,
    violations: result.violations,
    analytics: result.analytics,
  });

  const rankInfo = await calculateRankAndPercentile({ Attempt, testId: test._id, score: result.score });
  attempt.rank = rankInfo.rank;
  attempt.percentile = rankInfo.percentile;
  await attempt.save();

  res.json({
    success: true,
    attempt,
    analysis: {
      ...result,
      rank: attempt.rank,
      percentile: attempt.percentile,
      percent: result.maxScore ? Math.round((result.score / result.maxScore) * 100) : 0,
      perQuestion: result.analytics.perQuestion,
      topicWise: result.analytics.topicWise,
      difficultyWise: result.analytics.difficultyWise,
      heatmap: result.analytics.heatmap,
      weakAreas: result.analytics.weakAreas,
      strongAreas: result.analytics.strongAreas,
      wrong: result.analytics.perQuestion.filter((item) => item.status === "WRONG"),
    },
  });
});

export const getAttempt = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid attempt ID', 400));
  }

  const attempt = await Attempt.findById(id).populate('test');
  if (!attempt) return next(new AppError('Attempt not found', 404));
  res.json({
    success: true,
    attempt,
    analysis: {
      score: attempt.score,
      maxScore: attempt.maxScore,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      skippedCount: attempt.skippedCount,
      accuracy: attempt.accuracy,
      rank: attempt.rank,
      percentile: attempt.percentile,
      perQuestion: attempt.analytics?.perQuestion || [],
      topicWise: attempt.analytics?.topicWise || [],
      difficultyWise: attempt.analytics?.difficultyWise || [],
      heatmap: attempt.analytics?.heatmap || [],
      weakAreas: attempt.analytics?.weakAreas || [],
      strongAreas: attempt.analytics?.strongAreas || [],
    },
  });
});

export const ingestTestFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError("No file uploaded", 400));

  try {
    const parsed = await ingestExamFile(req.file, {
      optionsCount: Number(req.body.optionsCount || 4),
      marksPerQuestion: Number(req.body.marksPerQuestion || 1),
      topic: req.body.topic || "General",
    });

    res.status(200).json({
      ...parsed,
      duplicates: detectDuplicateQuestions(parsed.questions),
    });
  } catch (error) {
    return next(new AppError(error.message || "Failed to ingest exam file", 400));
  }
});

export const createTestFromIngestion = asyncHandler(async (req, res, next) => {
  const questions = (req.body.questions || []).map((question) => ({
    ...question,
    reviewStatus: question.reviewStatus || "VALID",
  }));

  const payload = buildTestPayload({ ...req.body, questions }, req.user?._id);
  if (!payload.title || !payload.questions.length) {
    return next(new AppError("Missing title or parsed questions", 400));
  }

  const test = await Test.create(payload);
  const reviewQueue = test.questions.filter((question) => question.reviewStatus !== "VALID");

  res.status(201).json({
    success: true,
    test,
    reviewQueue,
    duplicates: detectDuplicateQuestions(test.questions),
  });
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

  res.status(201).json({
    success: true,
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    originalName: file.originalname,
    test: newTest,
  });
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
    res.json({ success: true, parsed, usedOcr: !!useOcr, files: files.map((file) => file.upload) });
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

    res.json({
      success: true,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      originalName: file.originalname,
      parsed,
    });

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
