import { detectImageMimeFromMagic } from "../../upload/assertUploadedImageMagic.js";
import { PRODUCT_BULK_IMPORT_IMAGE_URL_TIMEOUT_MS } from "../../../constants/productBulkImportConstants.js";
import { assertPublicHttpUrl, guardedImageFetch } from "./guardedImageFetch.js";

const MAX_PREFLIGHT_BYTES = 64 * 1024;

/**
 * @param {string} url
 */
export async function prevalidateBulkImportImageUrl(url) {
  const parsedUrl = await assertPublicHttpUrl(url);
  const normalizedUrl = parsedUrl.toString();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PRODUCT_BULK_IMPORT_IMAGE_URL_TIMEOUT_MS,
  );

  try {
    const response = await guardedImageFetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        Accept: "image/jpeg,image/png,image/webp,*/*",
        Range: `bytes=0-${MAX_PREFLIGHT_BYTES - 1}`,
      },
    });

    if (!response.ok && response.status !== 206) {
      throw new Error(`Фото недоступно (HTTP ${response.status})`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) {
      throw new Error("Фото пустое или недоступно");
    }

    const detected = detectImageMimeFromMagic(buffer);
    if (!detected) {
      throw new Error("Фото должно быть JPEG, PNG или WebP");
    }

    return normalizedUrl;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Превышено время ожидания фото");
    }
    throw error instanceof Error ? error : new Error("Не удалось проверить фото");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * @param {string} raw
 * @returns {string[]}
 */
export function parseBulkImportImageUrls(raw) {
  return String(raw ?? "")
    .split(/[;,\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
