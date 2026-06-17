import {
  isObjectStorageUploadEnabled,
  persistUploadToObjectStorage,
  resolveUploadFilename,
} from "./objectStorageUpload.js";

/**
 * После multer: сохранить на диск (уже сделано) или залить в object storage.
 *
 * @param {import('express').Request['file']} file
 * @returns {Promise<string>} filename для buildPublicUploadUrl
 */
export const finalizeUploadedFile = async (file) => {
  if (!file) {
    throw new Error("Файл не передан");
  }

  if (isObjectStorageUploadEnabled()) {
    return persistUploadToObjectStorage(file);
  }

  return resolveUploadFilename(file);
};
