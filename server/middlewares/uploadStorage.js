import multer from "multer";

import { buildUploadFilename } from "../services/upload/buildUploadFilename.js";
import { isObjectStorageUploadEnabled } from "../services/upload/objectStorageUpload.js";
import { UPLOADS_DIR, ensureUploadsDir } from "../services/upload/uploadsDir.js";

const createDiskStorage = () => {
  ensureUploadsDir();
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      try {
        ensureUploadsDir();
        cb(null, UPLOADS_DIR);
      } catch (error) {
        cb(
          error instanceof Error
            ? error
            : new Error("Не удалось создать папку uploads"),
        );
      }
    },
    filename: (_req, file, cb) => {
      cb(null, buildUploadFilename(file));
    },
  });
};

export const storage = isObjectStorageUploadEnabled()
  ? multer.memoryStorage()
  : createDiskStorage();
