import pdf from "pdf-parse";
import { ocrPdfBuffer } from "./ocr.service.js";

/* -----------------------------
   CLEAN OCR TEXT
------------------------------*/
function cleanOCRText(text) {
  return text
    .replace(/[^\x20-\x7E\n]/g, "") // remove garbage characters
    .replace(/\n{2,}/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* -----------------------------
   EXTRACT PDF TEXT
------------------------------*/
async function extractText(fileBuffer) {
  try {
    const data = await pdf(fileBuffer);
    return data?.text || "";
  } catch {
    return "";
  }
}

/* -----------------------------
   OCR DECISION
------------------------------*/
function shouldRunOCR(text, opts) {
  return opts?.useOcr && (!text || text.trim().length < 50);
}

/* -----------------------------
   ANSWER DETECTOR
------------------------------*/
function detectAnswerKey(text) {
  const match =
    text.match(/(?:Answer|Ans|Correct|Key)\s*[:\-]?\s*\(?([A-Da-d])\)?/i) ||
    text.match(/(?:Answer|Ans)\s+([A-Da-d])/i);

  return match ? match[1].toUpperCase() : null;
}

/* -----------------------------
   INLINE OPTIONS PARSER
------------------------------*/
function parseInlineOptions(text) {
  const matches = [...text.matchAll(/([A-Da-d])[)\.\-:]/g)];
  if (!matches.length) return [];

  const options = [];

  for (let i = 0; i < matches.length; i++) {
    const key = matches[i][1].toUpperCase();
    const start = matches[i].index + matches[i][0].length;
    const end = matches[i + 1]?.index || text.length;

    const value = text.slice(start, end).replace(/\n/g, " ").trim();

    if (value) options.push({ key, text: value });
  }

  return options;
}

/* -----------------------------
   MAIN PARSER
------------------------------*/
export async function parsePdfToQuestions(fileBuffer, originalname = "", opts = {}) {
  let text = "";
  const debug = { lines: [], blocks: [] };

  /* 1. PDF TEXT EXTRACTION */
  text = await extractText(fileBuffer);

  /* 2. OCR FALLBACK */
  if (shouldRunOCR(text, opts)) {
    try {
      const ocr = await ocrPdfBuffer(fileBuffer, { logger: opts.logger });

      if (ocr?.text) {
        text = text ? `${text}\n${ocr.text}` : ocr.text;
        debug.ocr = ocr;
      }
    } catch (err) {
      debug.ocr = { error: "OCR_FAILED", message: String(err) };
    }
  }

  /* 3. CLEAN TEXT */
  text = cleanOCRText(text);

  /* 4. SPLIT INTO LINES */
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  /* 5. REGEX (IMPROVED) */
  const questionStartRe =
    /^\s*(?:\d+[\).:-]|\(?Q\s*\d+\)?|Question\s*\d*[:.-]?)/i;

  const answerRe = /^(Answer|Ans|Correct|Key)\s*[:\-]/i;

  /* 6. BUILD BLOCKS */
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (questionStartRe.test(line) && current.length) {
      blocks.push(current);
      current = [line];
      continue;
    }

    current.push(line);

    if (answerRe.test(line)) {
      blocks.push(current);
      current = [];
    }
  }

  if (current.length) blocks.push(current);

  const questions = [];

  /* 7. PARSE BLOCKS */
  for (const block of blocks) {
    const joined = block.join(" ");

    let options = parseInlineOptions(joined);
    let questionText = "";

    if (options.length >= 2) {
      const idx = joined.search(/([A-Da-d])[)\.\-:]/);

      questionText =
        idx > -1
          ? joined
              .slice(0, idx)
              .replace(/^\d+\.?\s*|^Q\d*[:.)-]?\s*/i, "")
              .trim()
          : "";
    } else {
      const optionLines = block.filter((l) =>
        /^[A-Da-d][)\.\-:]/.test(l)
      );

      if (optionLines.length >= 2) {
        questionText = block[0]
          .replace(/^\d+\.?\s*|^Q\d*[:.)-]?\s*/i, "")
          .trim();

        options = optionLines.map((l, i) => ({
          key: String.fromCharCode(65 + i),
          text: l.replace(/^[A-Da-d][)\.\-:]\s*/, "").trim(),
        }));
      } else {
        continue;
      }
    }

    const correct = detectAnswerKey(joined);

    const finalOptions = options.map((o) => ({
      text: o.text,
      isCorrect: correct ? o.key === correct : false,
    }));

    if (questionText && finalOptions.length >= 2) {
      questions.push({
        text: questionText,
        options: finalOptions,
      });
    }
  }

  /* 8. FALLBACK (IMPORTANT) */
  if (questions.length === 0 && lines.length > 3) {
    for (let i = 0; i < lines.length - 2; i++) {
      const q = lines[i];
      const a = lines[i + 1];
      const b = lines[i + 2];

      if (q.length > 10 && a.length > 2 && b.length > 2) {
        questions.push({
          text: q,
          options: [
            { text: a, isCorrect: false },
            { text: b, isCorrect: false },
          ],
        });
      }
    }
  }

  /* 9. RETURN */
  return {
    title: lines[0] || originalname,
    questions,
    ...(opts.debug
      ? { _debug: { lines, blocks, ocr: debug.ocr } }
      : {}),
  };
}

export default { parsePdfToQuestions };