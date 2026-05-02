import { Router } from "express";
import { authorizeRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  getAllExcelFiles,
  getExcelFileById,
  deleteExcelFileById,
  uploadExcel,
} from "../controllers/upload.controller.js";
import validateObjectId from "../middlewares/validateObjectId.middleware.js";
import { ipLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Excel file routes
router
  .route("/")
  .get(ipLimiter, getAllExcelFiles) // anyone can fetch metadata
  .post(ipLimiter, isLoggedIn, authorizeRoles("USER","ADMIN", "SUPERADMIN"), upload.single("excel"), uploadExcel);

router
  .route("/:id")
  .get(ipLimiter, isLoggedIn, validateObjectId, getExcelFileById)
  .delete(ipLimiter, isLoggedIn,  authorizeRoles("USER","ADMIN", "SUPERADMIN"), validateObjectId, deleteExcelFileById);

export default router;
