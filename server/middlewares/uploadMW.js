import multer from "multer";

import { UPLOADS_DIR, ensureUploadsDir } from "../utils/uploadsDir.js";

ensureUploadsDir();

export const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensureUploadsDir();
      cb(null, UPLOADS_DIR);
    } catch (error) {
      cb(error instanceof Error ? error : new Error("Не удалось создать папку uploads"));
    }
  },
  filename: (_req, file, cb) => {
    const raw = file.mimetype.split("/")[1] || "bin";
    const ext = raw.replace(/[^a-z0-9]/gi, "") || "bin";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`);
  },
});

const ALLOWED_UPLOAD_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const fileFilter = (_req, file, cb) => {
  if (ALLOWED_UPLOAD_MIMES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(null, false);
};

const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export const uploadMW = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMIT },
});
