import fs from "fs/promises";

import pdf from "pdf-parse";
import * as XLSX from "xlsx";

const optionLinePattern = /^\s*(?:\(?([A-Ea-e1-5])\)?[.):-]|\(([A-Ea-e])\))\s+(.+)$/;

const normalizeDifficulty = (text = "") => {
  const length = text.length;
  if (length < 90) return "EASY";
  if (length > 220) return "HARD";
  return "MEDIUM";
};

const detectCorrectAnswers = (block = "", options = []) => {
  const answerLine = block
    .split(/\r?\n/)
    .find((line) => /(?:answer|correct)\s*[:.)-]/i.test(line));

  if (!answerLine) return [];

  const letters = [...answerLine.matchAll(/\b([A-E])\b/gi)].map((match) =>
    match[1].toUpperCase().charCodeAt(0) - 65
  );

  return [...new Set(letters)].filter((index) => index >= 0 && index < options.length);
};

const hasMultiCorrectSignal = (text = "") =>
  /more than one|multiple correct|select all|all correct/i.test(text);

const hasNoneOfAbove = (options = []) =>
  options.some((option) => /none of the above/i.test(option.text));

export const validateParsedQuestion = (question, optionsCount) => {
  const notes = [];

  if (!question.text?.trim()) notes.push("Question text is missing");
  if (question.options.length < 4) notes.push("Question must have at least 4 options");
  if (question.options.length > 5) notes.push("Question cannot have more than 5 options");
  if (optionsCount && question.options.length !== optionsCount) {
    notes.push(`Expected ${optionsCount} options but found ${question.options.length}`);
  }
  if (!question.correctAnswers.length) notes.push("Correct answer could not be detected");

  return {
    ...question,
    reviewStatus: notes.length ? "NEEDS_REVIEW" : "VALID",
    reviewNotes: notes,
  };
};

export const parseMCQsFromText = (rawText = "", config = {}) => {
  const text = rawText.replace(/\u00a0/g, " ").trim();
  if (!text) return [];

  const blocks = text
    .split(/\n\s*(?=(?:Q\.?|Question)?\s*\d{1,4}[\).:-]\s+)/i)
    .map((block) => block.trim())
    .filter(Boolean);

  const usableBlocks = blocks.length > 1 ? blocks : text.split(/\n{2,}/).filter(Boolean);

  return usableBlocks
    .map((block) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const options = [];
      const questionLines = [];

      lines.forEach((line) => {
        const optionMatch = line.match(optionLinePattern);
        if (optionMatch) {
          options.push({
            text: optionMatch[3].replace(/\s*\[(?:correct|answer)\]\s*$/i, "").trim(),
            isCorrect: /\[(?:correct|answer)\]/i.test(line),
          });
          return;
        }

        if (!/(?:answer|correct)\s*[:.)-]/i.test(line)) {
          questionLines.push(line.replace(/^(?:Q\.?|Question)?\s*\d{1,4}[\).:-]\s*/i, ""));
        }
      });

      const correctFromMarkers = options
        .map((option, index) => (option.isCorrect ? index : -1))
        .filter((index) => index >= 0);
      const correctAnswers = correctFromMarkers.length
        ? correctFromMarkers
        : detectCorrectAnswers(block, options);

      const question = {
        text: questionLines.join(" ").trim(),
        options: options.map((option, index) => ({
          text: option.text,
          isCorrect: correctAnswers.includes(index),
        })),
        correctAnswers,
        marks: Number(config.marksPerQuestion || 1),
        difficulty: normalizeDifficulty(questionLines.join(" ")),
        topic: config.topic || "General",
        source: {
          type: config.sourceType || "AI",
          fileName: config.fileName,
        },
        flags: {
          hasNoneOfAbove: hasNoneOfAbove(options),
          hasMultiCorrectSignal: hasMultiCorrectSignal(block),
        },
      };

      return validateParsedQuestion(question, config.optionsCount);
    })
    .filter((question) => question.text || question.options.length);
};

export const extractTextFromPdf = async (file) => {
  const buffer = file.buffer || await fs.readFile(file.path);
  const data = await pdf(buffer);
  return data.text;
};

export const extractTextFromExcel = async (file) => {
  const buffer = file.buffer || await fs.readFile(file.path);
  const workbook = XLSX.read(buffer, { type: "buffer" });

  return workbook.SheetNames.flatMap((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
      raw: false,
    });

    return rows.map((row) => Object.values(row).join("\n"));
  }).join("\n\n");
};

export const extractTextFromImage = async (file) => {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(file.path);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
};

export const ingestExamFile = async (file, config = {}) => {
  const sourceType = file.fileType?.toUpperCase() || "AI";
  let text = "";

  if (file.fileType === "pdf") text = await extractTextFromPdf(file);
  if (file.fileType === "excel") text = await extractTextFromExcel(file);
  if (file.fileType === "image") text = await extractTextFromImage(file);

  const questions = parseMCQsFromText(text, {
    ...config,
    sourceType,
    fileName: file.originalname,
  });

  return {
    success: true,
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    originalName: file.originalname,
    rawText: text,
    questions,
    reviewQueue: questions.filter((question) => question.reviewStatus !== "VALID"),
  };
};

export const detectDuplicateQuestions = (questions = []) => {
  const seen = new Map();
  const duplicates = [];

  questions.forEach((question, index) => {
    const key = question.text.toLowerCase().replace(/\W+/g, " ").trim();
    if (seen.has(key)) duplicates.push({ index, duplicateOf: seen.get(key), text: question.text });
    else seen.set(key, index);
  });

  return duplicates;
};

