import { resolveUploadFileExtension } from "./resolveUploadFileExtension.js";

/**
 * @param {Pick<Express.Multer.File, "mimetype" | "originalname">} file
 */
export const buildUploadFilename = (file) => {
  const extension = resolveUploadFileExtension(file);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${extension}`;
};
