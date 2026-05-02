import { Router } from 'express';

import { isLoggedIn, authorizeRoles } from '../middlewares/auth.middleware.js';
import validateObjectId from '../middlewares/validateObjectId.middleware.js';
import { createTest, getAttempt, getTest, listTests, submitAttempt, listAttempts, uploadPdfAndCreateTest, parsePdfOnly, importParsedTest, mergePdfsAndParse, listMyAttempts, getLeaderboard } from '../controllers/test.controller.js';
import upload from '../middlewares/multer.middleware.js';

// const router = Router();

// router.get('/', listTests);
// router.post('/', isLoggedIn, createTest); // protected
// router.get('/:id', isLoggedIn, getTest);
// router.post('/:id/submit', isLoggedIn, submitAttempt);
// router.get('/attempt/:id', isLoggedIn, getAttempt);

// export default router;


const router = Router();

router.
    route('/')
    .get(listTests)
    .post(isLoggedIn, createTest)

// router.get('/', listTests);
router.post('/', isLoggedIn, createTest);

// ✅ specific routes first
router.get('/attempts', isLoggedIn, listAttempts);
// my attempts
router.get('/attempts/me', isLoggedIn, listMyAttempts);
router.get('/attempt/:id', isLoggedIn, getAttempt);
// leaderboard (public - allow visiting leaderboards without authentication)
router.get('/:id/leaderboard', validateObjectId, getLeaderboard);
// Parse-only endpoint (preview) and import endpoint (final save)
router.post('/parse-pdf', isLoggedIn, authorizeRoles('ADMIN','SUPERADMIN'), upload.single('pdf'), parsePdfOnly);
router.post('/merge-parse', isLoggedIn, authorizeRoles('ADMIN','SUPERADMIN'), upload.array('pdfs', 8), mergePdfsAndParse);
router.post('/import-parsed', isLoggedIn, authorizeRoles('ADMIN','SUPERADMIN'), importParsedTest);
// Backwards-compatible single-step upload+create
router.post('/upload-pdf', isLoggedIn, authorizeRoles('ADMIN','SUPERADMIN'), upload.single('pdf'), uploadPdfAndCreateTest);
// router.post('/:id/submit', isLoggedIn, submitAttempt);

// ❌ generic route last
router.get('/:id', isLoggedIn, validateObjectId, getTest);

// Protect submit route and validate provided id param
router.post('/:id/submit', isLoggedIn, validateObjectId, submitAttempt);

export default router;
