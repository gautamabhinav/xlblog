# AI Online Examination Platform Architecture

## Services

- Auth Service: JWT auth and role checks.
- Test Service: exam configuration, manual creation, publishing.
- Ingestion Service: PDF, Excel, CSV, and image text extraction.
- AI Parsing Service: MCQ extraction, duplicate detection, validation, review queue.
- Result Engine Service: formula-based scoring, analytics, rank, percentile.

## Important Routes

- `POST /api/v1/tests` creates a manual exam.
- `POST /api/v1/tests/ingest` parses `file` uploads: PDF, Excel, CSV, image.
- `POST /api/v1/tests/from-ingestion` creates a test from reviewed parsed questions.
- `GET /api/v1/tests/:id` returns a student-safe test.
- `POST /api/v1/tests/:id/submit` submits answers and calculates score.
- `GET /api/v1/tests/attempt/:id` returns result analytics.
- `GET /api/v1/tests/:id/leaderboard` returns rankings.

## Scoring Formula

The engine uses:

```txt
score = correct * marks_per_question - (wrong / penalty_ratio)
```

When negative marking is disabled, `penalty_ratio` is `0` and wrong answers do not reduce score.

Examples:

- SSC: `penalty_ratio = 4`
- UPSC: `penalty_ratio = 3`
- BPSC/custom no negative: `negativeMarkingEnabled = false`

## Upload Folders

- `server/uploads/images`
- `server/uploads/pdfs`
- `server/uploads/excel`
- `server/uploads/others`

## Environment

Server:

```txt
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRY=7d
FRONTEND_URL=https://your-frontend.vercel.app
PUBLIC_API_URL=https://your-backend.onrender.com
UPLOAD_OTHER_MAX_SIZE=10485760
```

Client:

```txt
VITE_API_URL=https://your-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://your-backend.onrender.com
```

## Deployment

1. Deploy MongoDB Atlas and copy the connection string.
2. Deploy `server` to Render/Railway/AWS with the server environment variables.
3. Deploy `client` to Vercel with `VITE_API_URL`.
4. Enable persistent disk storage for Render uploads or configure Cloudinary/S3 for durable file storage.
5. Run `npm run build` in `client` and `npm test` in `server` before release.

## Extending File Types

Add a type in `server/src/configs/multer.config.js`, then update the ingestion service extractor. Routes only need:

```js
uploadSingle("file", ["video"])
```

## AI Enhancements

The ingestion service currently performs deterministic parsing and validation. Add an LLM provider behind `examIngestion.service.js` to transform raw text into structured questions before validation.
