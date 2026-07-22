import { randomBytes } from "node:crypto";

import { resolveUploadFileExtension } from "./resolveUploadFileExtension.js";

/**
 * Имя файла: метка времени + крипто-стойкий токен (128 бит).
 * Токен из `crypto.randomBytes`, а не `Math.random`, чтобы имя нельзя было
 * угадать/перебрать — секретность имени не должна быть слабым звеном для
 * приватных PII-файлов (селфи паспорта).
 *
 * @param {Pick<Express.Multer.File, "mimetype" | "originalname">} file
 */
export const buildUploadFilename = (file) => {
  const extension = resolveUploadFileExtension(file);
  const token = randomBytes(16).toString("hex");
  return `${Date.now()}-${token}.${extension}`;
};
