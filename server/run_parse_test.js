import { PDFDocument, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import { parsePdfToQuestions } from './src/services/pdf.service.js';

async function makePdfBuffer() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const text = `1. What is 2+2?\nA) 3\nB) 4\nAnswer: B`;
  page.drawText(text, { x: 50, y: 300, size: 12, font });
  const bytes = await pdfDoc.save();
  return bytes;
}

async function run() {
  try {
    const buf = await makePdfBuffer();
    console.log('PDF buffer created', buf.byteLength);
    const res = await parsePdfToQuestions(Buffer.from(buf), 'test.pdf', { debug: true, useOcr: false });
    console.log('Parse result (no OCR):', JSON.stringify(res, null, 2));

    const resOcr = await parsePdfToQuestions(Buffer.from(buf), 'test.pdf', { debug: true, useOcr: true });
    console.log('Parse result (with OCR):', JSON.stringify(resOcr, null, 2));
  } catch (err) {
    console.error('Test failed', err);
  }
}

run();
