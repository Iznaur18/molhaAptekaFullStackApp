import multer from "multer";

import {
  UPLOAD_IMAGE_MAX_BYTES,
  UPLOAD_IMAGE_MIME_TYPES,
} from "../constants/uploadConstants.js";
import { storage } from "./uploadStorage.js";

const imageMimeSet = new Set(UPLOAD_IMAGE_MIME_TYPES);

export const fileFilter = (_req, file, cb) => {
  if (imageMimeSet.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(null, false);
};

export const uploadMW = multer({
  storage,
  fileFilter,
  limits: { fileSize: UPLOAD_IMAGE_MAX_BYTES },
});

export { storage };
