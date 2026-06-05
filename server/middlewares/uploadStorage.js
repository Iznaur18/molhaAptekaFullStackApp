import multer from "multer";

import { buildUploadFilename } from "../utils/buildUploadFilename.js";
import { isObjectStorageUploadEnabled } from "../utils/objectStorageUpload.js";
import { UPLOADS_DIR, ensureUploadsDir } from "../utils/uploadsDir.js";

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
      cb(null, buildUploadFilename(file.mimetype));
    },
  });
};

export const storage = isObjectStorageUploadEnabled()
  ? multer.memoryStorage()
  : createDiskStorage();
