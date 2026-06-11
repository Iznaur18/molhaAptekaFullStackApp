import multer from "multer";

import { UPLOAD_VIDEO_MAX_BYTES } from "../constants/uploadConstants.js";
import { isAllowedUploadVideoFile } from "../utils/isAllowedUploadVideoFile.js";
import { storage } from "./uploadStorage.js";

export const videoFileFilter = (_req, file, cb) => {
  cb(null, isAllowedUploadVideoFile(file));
};

export const uploadVideoMW = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: UPLOAD_VIDEO_MAX_BYTES },
});
