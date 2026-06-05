import multer from "multer";

import {
  UPLOAD_VIDEO_MAX_BYTES,
  UPLOAD_VIDEO_MIME_TYPES,
} from "../constants/uploadConstants.js";
import { storage } from "./uploadStorage.js";

const videoMimeSet = new Set(UPLOAD_VIDEO_MIME_TYPES);

export const videoFileFilter = (_req, file, cb) => {
  if (videoMimeSet.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(null, false);
};

export const uploadVideoMW = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: UPLOAD_VIDEO_MAX_BYTES },
});
