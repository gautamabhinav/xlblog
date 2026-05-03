const toSelectedIndexes = (answer = {}) => {
  if (Array.isArray(answer.selectedOptionIndexes)) {
    return answer.selectedOptionIndexes.map(Number).sort((a, b) => a - b);
  }

  if (answer.selectedOptionIndex === undefined || answer.selectedOptionIndex === null) {
    return [];
  }

  return [Number(answer.selectedOptionIndex)];
};

const getCorrectIndexes = (question = {}) => {
  if (Array.isArray(question.correctAnswers) && question.correctAnswers.length) {
    return question.correctAnswers.map(Number).sort((a, b) => a - b);
  }

  return (question.options || [])
    .map((option, index) => (option.isCorrect ? index : -1))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);
};

const sameSet = (left = [], right = []) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const summarizeGroup = (rows, key) => {
  const bucket = new Map();

  rows.forEach((row) => {
    const name = row[key] || "General";
    if (!bucket.has(name)) {
      bucket.set(name, { name, total: 0, correct: 0, wrong: 0, skipped: 0, score: 0 });
    }
    const item = bucket.get(name);
    item.total += 1;
    item.correct += row.status === "CORRECT" ? 1 : 0;
    item.wrong += row.status === "WRONG" ? 1 : 0;
    item.skipped += row.status === "SKIPPED" ? 1 : 0;
    item.score += row.score;
  });

  return [...bucket.values()].map((item) => ({
    ...item,
    accuracy: item.total ? Math.round((item.correct / item.total) * 100) : 0,
  }));
};

export const buildExamConfig = (test = {}) => {
  const marksPerQuestion = Number(test.marksPerQuestion || 1);
  const negativeMarkingEnabled = Boolean(test.negativeMarkingEnabled);
  const penaltyRatio = negativeMarkingEnabled ? Number(test.penaltyRatio || 0) : 0;

  return {
    marksPerQuestion,
    negativeMarkingEnabled,
    penaltyRatio,
  };
};

export const calculateScore = ({ test, answers = [], durationSeconds = 0, violations = {} }) => {
  const config = buildExamConfig(test);
  const answerMap = new Map(answers.map((answer) => [String(answer.questionId), answer]));

  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let score = 0;
  let maxScore = 0;

  const perQuestion = (test.questions || []).map((question, index) => {
    const answer = answerMap.get(String(question._id));
    const selected = toSelectedIndexes(answer);
    const correctAnswers = getCorrectIndexes(question);
    const marks = Number(question.marks || config.marksPerQuestion);
    const penalty = config.negativeMarkingEnabled && config.penaltyRatio > 0
      ? marks / config.penaltyRatio
      : 0;

    maxScore += marks;

    let status = "SKIPPED";
    let questionScore = 0;

    if (!selected.length) {
      skipped += 1;
    } else if (sameSet(selected, correctAnswers)) {
      correct += 1;
      status = "CORRECT";
      questionScore = marks;
    } else {
      wrong += 1;
      status = "WRONG";
      questionScore = -penalty;
    }

    score += questionScore;

    return {
      questionId: question._id,
      questionNumber: index + 1,
      text: question.text,
      options: (question.options || []).map((option) => option.text),
      selected,
      selectedOptionIndex: selected[0] ?? null,
      correctAnswers,
      correctIndex: correctAnswers[0] ?? null,
      got: status === "CORRECT" ? 1 : 0,
      status,
      score: Number(questionScore.toFixed(2)),
      marks,
      topic: question.topic || "General",
      difficulty: question.difficulty || "MEDIUM",
      timeSpentSeconds: Number(answer?.timeSpentSeconds || 0),
      markedForReview: Boolean(answer?.markedForReview),
    };
  });

  const attempted = correct + wrong;
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const topicWise = summarizeGroup(perQuestion, "topic");
  const difficultyWise = summarizeGroup(perQuestion, "difficulty");

  return {
    score: Number(score.toFixed(2)),
    maxScore,
    correctCount: correct,
    wrongCount: wrong,
    skippedCount: skipped,
    accuracy,
    durationSeconds,
    violations,
    analytics: {
      perQuestion,
      topicWise,
      difficultyWise,
      weakAreas: topicWise.filter((topic) => topic.accuracy < 50).map((topic) => topic.name),
      strongAreas: topicWise.filter((topic) => topic.accuracy >= 75).map((topic) => topic.name),
      heatmap: perQuestion.map((item) => ({
        questionNumber: item.questionNumber,
        status: item.status,
        timeSpentSeconds: item.timeSpentSeconds,
        markedForReview: item.markedForReview,
      })),
    },
  };
};

export const calculateRankAndPercentile = async ({ Attempt, testId, score }) => {
  const attempts = await Attempt.find({ test: testId }).select("score").lean();
  const total = attempts.length || 1;
  const better = attempts.filter((attempt) => attempt.score > score).length;
  const lowerOrEqual = attempts.filter((attempt) => attempt.score <= score).length;

  return {
    rank: better + 1,
    percentile: Math.round((lowerOrEqual / total) * 10000) / 100,
  };
};

