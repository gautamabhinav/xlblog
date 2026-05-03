import fs from "fs/promises";

import multer from "multer";

import {
  buildFileUrl,
  createMulter,
  formatUploadFile,
  getFileCategory,
  getMaxUploadSize,
} from "../configs/multer.config.js";
import AppError from "../utils/AppError.js";

const removeFile = async (file) => {
  if (!file?.path) return;
  await fs.rm(file.path, { force: true });
};

const toFileList = (req) => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === "object") {
    return Object.values(req.files).flat();
  }
  return [];
};

const enrichFiles = async (req, _res, next) => {
  try {
    const files = toFileList(req);

    for (const file of files) {
      file.fileType = getFileCategory(file.mimetype);
      const publicPath = buildFileUrl(file);
      const baseUrl =
        process.env.PUBLIC_API_URL ||
        process.env.BACKEND_URL ||
        `${req.protocol}://${req.get("host")}`;
      file.fileUrl = publicPath ? new URL(publicPath, baseUrl).toString() : null;
      file.upload = formatUploadFile(file);

      const maxSize = getMaxUploadSize(file.fileType);
      if (file.size > maxSize) {
        await removeFile(file);
        return next(
          new AppError(
            `${file.fileType} file is too large. Max size is ${Math.round(maxSize / (1024 * 1024))}MB`,
            400
          )
        );
      }

      if (!file.buffer && file.path) {
        file.buffer = await fs.readFile(file.path);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

const runUpload = (uploader) => (req, res, next) => {
  uploader(req, res, (error) => {
    if (error) return next(error);
    return enrichFiles(req, res, next);
  });
};

export const uploadSingle = (fieldName, allowedTypes = []) =>
  runUpload(createMulter(allowedTypes).single(fieldName));

export const uploadMultiple = (fieldName, allowedTypes = [], maxCount = 5) =>
  runUpload(createMulter(allowedTypes).array(fieldName, maxCount));

export const uploadFields = (fields, allowedTypes = []) =>
  runUpload(createMulter(allowedTypes).fields(fields));

export const uploadResponse = (req, res, next) => {
  const files = toFileList(req);
  if (!files.length) return next(new AppError("No file uploaded", 400));

  if (req.file) {
    return res.status(201).json(req.file.upload);
  }

  return res.status(201).json({
    success: true,
    files: files.map((file) => file.upload),
  });
};

export const multerErrorHandler = (err, _req, res, next) => {
  if (!err || !(err instanceof multer.MulterError)) return next(err);

  const messages = {
    LIMIT_FILE_SIZE: "Uploaded file is too large",
    LIMIT_FILE_COUNT: "Too many files uploaded",
    LIMIT_UNEXPECTED_FILE: err.field || "Unsupported file type or unexpected file field",
  };

  res.status(400).json({
    success: false,
    message: messages[err.code] || err.message,
  });
};

const upload = {
  single: (fieldName) => uploadSingle(fieldName),
  array: (fieldName, maxCount) => uploadMultiple(fieldName, [], maxCount),
  fields: (fields) => uploadFields(fields),
};

export default upload;
