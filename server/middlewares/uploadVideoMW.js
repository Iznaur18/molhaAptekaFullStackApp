import multer from "multer";

import { isAllowedUploadVideoFile } from "../services/upload/isAllowedUploadVideoFile.js";
import { resolveVideoUploadProfile } from "../services/upload/resolveVideoUploadProfile.js";
import { storage } from "./uploadStorage.js";

export const videoFileFilter = (_req, file, cb) => {
  cb(null, isAllowedUploadVideoFile(file));
};

const uploadByMaxBytes = new Map();

/**
 * @param {number} fileSize
 */
const getVideoUploadMW = (fileSize) => {
  if (!uploadByMaxBytes.has(fileSize)) {
    uploadByMaxBytes.set(
      fileSize,
      multer({
        storage,
        fileFilter: videoFileFilter,
        limits: { fileSize },
      }),
    );
  }
  return uploadByMaxBytes.get(fileSize);
};

/**
 * Диспетчер лимитов: intro/story — повышенный лимит исходника + пережатие на сервере,
 * остальные видео — стандартный лимит.
 */
export const uploadVideoMW = {
  single: (fieldName) => {
    return (req, res, next) => {
      const { maxBytes } = resolveVideoUploadProfile(req);
      getVideoUploadMW(maxBytes).single(fieldName)(req, res, next);
    };
  },
};
