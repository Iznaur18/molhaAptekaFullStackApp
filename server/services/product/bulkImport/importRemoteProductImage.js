import { writeFile } from "node:fs/promises";
import path from "node:path";

import { detectImageMimeFromMagic } from "../../upload/assertUploadedImageMagic.js";
import { buildUploadFilename } from "../../upload/buildUploadFilename.js";
import { compressUploadedImageFile } from "../../upload/compressUploadedImageFile.js";
import { finalizeUploadedFile } from "../../upload/finalizeUploadedFile.js";
import { buildPublicUploadUrl } from "../../upload/buildPublicUploadUrl.js";
import { UPLOADS_DIR } from "../../upload/uploadsDir.js";
import { PRODUCT_BULK_IMPORT_IMAGE_URL_TIMEOUT_MS } from "../../../constants/productBulkImportConstants.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";
import { assertPublicHttpUrl, guardedImageFetch } from "./guardedImageFetch.js";

const MAX_DOWNLOAD_BYTES = 12 * 1024 * 1024;

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function importRemoteProductImage(url) {
  const parsedUrl = await assertPublicHttpUrl(url);
  const safeUrl = parsedUrl.toString();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PRODUCT_BULK_IMPORT_IMAGE_URL_TIMEOUT_MS,
  );

  try {
    const response = await guardedImageFetch(safeUrl, {
      signal: controller.signal,
      headers: { Accept: "image/jpeg,image/png,image/webp,*/*" },
    });

    if (!response.ok) {
      throw new Error(`Фото недоступно (HTTP ${response.status})`);
    }

    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_DOWNLOAD_BYTES) {
      throw new Error("Фото слишком большое");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_DOWNLOAD_BYTES) {
      throw new Error("Фото слишком большое или пустое");
    }

    const detectedMime = detectImageMimeFromMagic(buffer);
    if (!detectedMime) {
      throw new Error("Фото должно быть JPEG, PNG или WebP");
    }

    /** @type {import('express').Multer.File} */
    const file = {
      fieldname: "image",
      originalname: `import${path.extname(parsedUrl.pathname) || ".jpg"}`,
      encoding: "7bit",
      mimetype: detectedMime,
      size: buffer.length,
      buffer,
      destination: UPLOADS_DIR,
      filename: "",
      path: "",
      stream: undefined,
    };

    const tempFilename = buildUploadFilename(file);
    const tempPath = path.join(UPLOADS_DIR, tempFilename);
    file.path = tempPath;
    file.filename = tempFilename;

    await writeFile(tempPath, buffer);

    try {
      await compressUploadedImageFile(file);
    } catch (compressError) {
      logServerEvent("warn", {
        event: "bulk_import_image_compress_failed",
        error:
          compressError instanceof Error
            ? compressError.message
            : String(compressError),
      });
    }

    const storedFilename = await finalizeUploadedFile(file);
    return buildPublicUploadUrl({ filename: storedFilename });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Превышено время ожидания фото");
    }
    throw error instanceof Error ? error : new Error("Не удалось скачать фото");
  } finally {
    clearTimeout(timeout);
  }
}
