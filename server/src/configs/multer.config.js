import crypto from "crypto";
import fs from "fs";
import path from "path";

import multer from "multer";

export const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

export const FILE_CATEGORIES = {
  image: {
    folder: "images",
    maxSize: 5 * 1024 * 1024,
    matches: (mimeType) => mimeType.startsWith("image/"),
  },
  pdf: {
    folder: "pdfs",
    maxSize: 10 * 1024 * 1024,
    matches: (mimeType) => mimeType === "application/pdf",
  },
  excel: {
    folder: "excel",
    maxSize: 10 * 1024 * 1024,
    matches: (mimeType) =>
      [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
        "text/csv",
        "application/csv",
      ].includes(mimeType),
  },
  others: {
    folder: "others",
    maxSize: Number(process.env.UPLOAD_OTHER_MAX_SIZE || 10 * 1024 * 1024),
    matches: () => true,
  },
};

export const normalizeAllowedTypes = (allowedTypes = []) =>
  allowedTypes.length ? allowedTypes : ["image", "pdf", "excel", "others"];

export const getFileCategory = (mimeType = "") => {
  const match = Object.entries(FILE_CATEGORIES).find(
    ([key, config]) => key !== "others" && config.matches(mimeType)
  );

  return match?.[0] || "others";
};

export const getUploadFolder = (mimeType) =>
  FILE_CATEGORIES[getFileCategory(mimeType)].folder;

export const getMaxUploadSize = (category) =>
  FILE_CATEGORIES[category]?.maxSize || FILE_CATEGORIES.others.maxSize;

export const buildFileUrl = (file) =>
  file?.filename && file?.fileType
    ? `/uploads/${FILE_CATEGORIES[file.fileType].folder}/${file.filename}`
    : null;

export const formatUploadFile = (file) => ({
  success: true,
  fileUrl: file.fileUrl || buildFileUrl(file),
  fileType: file.fileType || getFileCategory(file.mimetype),
  originalName: file.originalname,
  filename: file.filename,
  mimeType: file.mimetype,
  size: file.size,
});

const ensureDirectory = (directory) => {
  fs.mkdirSync(directory, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const folder = getUploadFolder(file.mimetype);
    const destination = path.join(UPLOAD_ROOT, folder);
    ensureDirectory(destination);
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "");
    const safeName = path
      .basename(file.originalname || "upload", extension)
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;

    cb(null, `${uniqueSuffix}-${safeName || "file"}${extension.toLowerCase()}`);
  },
});

export const createMulter = (allowedTypes = []) => {
  const normalizedTypes = normalizeAllowedTypes(allowedTypes);
  const limit = Math.max(...normalizedTypes.map(getMaxUploadSize));

  return multer({
    storage,
    limits: { fileSize: limit },
    fileFilter: (_req, file, cb) => {
      const category = getFileCategory(file.mimetype);

      if (!normalizedTypes.includes(category)) {
        cb(
          new multer.MulterError(
            "LIMIT_UNEXPECTED_FILE",
            `Unsupported file type: ${file.mimetype}. Allowed: ${normalizedTypes.join(", ")}`
          )
        );
        return;
      }

      cb(null, true);
    },
  });
};
