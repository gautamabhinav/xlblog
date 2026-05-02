// // OCR service using OCR.space API (recommended for reliability without native builds).
// // Configure by setting environment variable OCR_SPACE_API_KEY.
// // If not configured, parsePdfToQuestions will return a clear error when OCR is requested.

// const fetch = global.fetch || require('node-fetch');

// async function ocrPdfBuffer(buffer, opts = {}) {
//   const apiKey = process.env.OCR_SPACE_API_KEY;
//   if (!apiKey) {
//     return { error: 'OCR_NOT_CONFIGURED', message: 'OCR_SPACE_API_KEY not set in environment. Set this to enable OCR.' };
//   }

//   try {
//     // Build multipart form data
//     const FormData = global.FormData || require('form-data');
//     const form = new FormData();
//     form.append('apikey', apiKey);
//     form.append('file', buffer, { filename: opts.filename || 'upload.pdf' });
//     form.append('isOverlayRequired', 'false');
//     form.append('language', opts.language || 'eng');

//     const res = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: form });
//     const json = await res.json();
//     if (!json || json.OCRExitCode === undefined) {
//       return { error: 'OCR_API_ERROR', message: 'Unexpected response from OCR provider', raw: json };
//     }
//     if (json.IsErroredOnProcessing) {
//       return { error: 'OCR_FAILED', message: json.ErrorMessage || json.ErrorDetails || 'OCR provider returned error', raw: json };
//     }

//     const pages = (json.ParsedResults || []).map(p => p.ParsedText || '');
//     const text = pages.join('\n\n');
//     return { text, pages, raw: json };
//   } catch (err) {
//     return { error: 'OCR_EXCEPTION', message: String(err) };
//   }
// }

// module.exports = { ocrPdfBuffer };


// OCR service using OCR.space API
// Requires: OCR_SPACE_API_KEY in environment

// Node 18+ already has fetch + FormData globally
// No need for node-fetch or form-data

export const ocrPdfBuffer = async (buffer, opts = {}) => {
  const apiKey = process.env.OCR_SPACE_API_KEY;

  if (!apiKey) {
    return {
      error: 'OCR_NOT_CONFIGURED',
      message: 'OCR_SPACE_API_KEY not set in environment. Set this to enable OCR.'
    };
  }

  try {
    // Use node-fetch + form-data for predictable behavior in Node
    const nf = await import('node-fetch');
    const fetchFn = nf.default || nf;
    const fm = await import('form-data');
    const FormDataCtor = fm.default || fm;

    const form = new FormDataCtor();
    form.append('apikey', apiKey);
    form.append('file', buffer, { filename: opts.filename || 'upload.pdf' });
    form.append('isOverlayRequired', 'false');
    form.append('language', opts.language || 'eng');

    const res = await fetchFn('https://api.ocr.space/parse/image', { method: 'POST', body: form });
    const json = await res.json();
    if (!json || json.OCRExitCode === undefined) {
      return { error: 'OCR_API_ERROR', message: 'Unexpected response from OCR provider', raw: json };
    }
    if (json.IsErroredOnProcessing) {
      return { error: 'OCR_FAILED', message: json.ErrorMessage || json.ErrorDetails || 'OCR provider returned error', raw: json };
    }
    const pages = (json.ParsedResults || []).map(p => p.ParsedText || '');
    const text = pages.join('\n\n');
    return { text, pages, raw: json };

  } catch (err) {
    return { error: 'OCR_EXCEPTION', message: String(err) };
  }
};