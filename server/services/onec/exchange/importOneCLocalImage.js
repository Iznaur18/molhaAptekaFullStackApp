import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ONEC_IMPORT_MAX_IMAGE_BYTES } from "../../../constants/onecExchangeConstants.js";
import { detectImageMimeFromMagic } from "../../upload/assertUploadedImageMagic.js";
import { buildPublicUploadUrl } from "../../upload/buildPublicUploadUrl.js";
import { buildUploadFilename } from "../../upload/buildUploadFilename.js";
import { compressUploadedImageFile } from "../../upload/compressUploadedImageFile.js";
import { finalizeUploadedFile } from "../../upload/finalizeUploadedFile.js";
import { UPLOADS_DIR } from "../../upload/uploadsDir.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

/**
 * @param {Buffer} buffer
 * @returns {string}
 */
export function hashImageBuffer(buffer) {
  return createHash("md5").update(buffer).digest("hex");
}

/**
 * Залить картинку из `import_files/` архива в хранилище сайта.
 *
 * Дедупликация по MD5 исходника выше уровнем (`upsertOneCProducts`): 1С при
 * каждой полной выгрузке кладёт в архив все картинки заново, и без сверки
 * хэшей S3 обрастал бы копией каталога на каждый обмен.
 *
 * @param {{ filePath: string }} params
 * @returns {Promise<{ url: string; hash: string } | null>} `null` — файл не картинка
 */
export async function importOneCLocalImage({ filePath }) {
  const buffer = await readFile(filePath);
  if (buffer.length === 0 || buffer.length > ONEC_IMPORT_MAX_IMAGE_BYTES) {
    return null;
  }

  const mimetype = detectImageMimeFromMagic(buffer);
  if (!mimetype) {
    return null;
  }

  const hash = hashImageBuffer(buffer);

  /** @type {import('express').Multer.File} */
  const file = {
    fieldname: "image",
    originalname: `onec${path.extname(filePath) || ".jpg"}`,
    encoding: "7bit",
    mimetype,
    size: buffer.length,
    buffer,
    destination: UPLOADS_DIR,
    filename: "",
    path: "",
    stream: undefined,
  };

  const tempFilename = buildUploadFilename(file);
  const tempPath = path.join(UPLOADS_DIR, tempFilename);
  file.filename = tempFilename;
  file.path = tempPath;
  await writeFile(tempPath, buffer);

  try {
    await compressUploadedImageFile(file);
  } catch (error) {
    logServerEvent("warn", {
      event: "onec.image_compress_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const storedFilename = await finalizeUploadedFile(file);
  return { url: buildPublicUploadUrl({ filename: storedFilename }), hash };
}
