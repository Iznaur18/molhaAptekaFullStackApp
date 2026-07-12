import { IMAGE_URL_FIELD_UI } from "../config/appUiCopy.js";
import {
  UPLOAD_ALLOWED_MIME_TYPES,
  UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION,
  UPLOAD_IMAGE_COMPRESS_TARGET_BYTES,
  UPLOAD_IMAGE_SOURCE_MAX_BYTES,
  UPLOAD_MAX_BYTES,
} from "../config/uploadConstants.js";

import {
  isBrowserHeicImageFile,
  resolveBrowserImageMimeType,
} from "./resolveBrowserImageMimeType.js";

/** Шаги качества JPEG при подгонке под целевой размер. */
const COMPRESS_QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4];
/** Во сколько раз уменьшаем сторону, если качество уже минимальное. */
const DIMENSION_STEP_RATIO = 0.75;
/** Ниже этой стороны не даунскейлим — фото станет нечитаемым. */
const MIN_DIMENSION = 640;

/**
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(IMAGE_URL_FIELD_UI.ERROR_TYPE));
    image.src = src;
  });
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} type
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(IMAGE_URL_FIELD_UI.ERROR_TYPE));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

/**
 * @param {Blob} blob
 * @param {string} namePrefix
 * @returns {File}
 */
function blobToJpegFile(blob, namePrefix) {
  return new File([blob], `${namePrefix}-${Date.now()}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/**
 * Итеративно сжимает изображение в JPEG: сначала даунскейл до максимальной
 * стороны, затем понижение качества; если не влезло — уменьшение стороны
 * и новый круг. Практически любое фото укладывается в целевой размер.
 *
 * @param {File} file
 * @param {string} namePrefix
 * @returns {Promise<File>}
 */
async function compressBrowserImageFileToJpeg(file, namePrefix) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(objectUrl);
    const sourceMaxSide = Math.max(image.naturalWidth, image.naturalHeight);
    let maxSide = Math.min(UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION, sourceMaxSide);
    let smallestBlob = null;

    for (;;) {
      const scale = Math.min(1, maxSide / sourceMaxSide);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error(IMAGE_URL_FIELD_UI.ERROR_TYPE);
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      for (const quality of COMPRESS_QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, "image/jpeg", quality);
        if (!smallestBlob || blob.size < smallestBlob.size) {
          smallestBlob = blob;
        }
        if (blob.size <= UPLOAD_IMAGE_COMPRESS_TARGET_BYTES) {
          return blobToJpegFile(blob, namePrefix);
        }
      }

      if (maxSide <= MIN_DIMENSION) {
        break;
      }
      maxSide = Math.max(MIN_DIMENSION, Math.round(maxSide * DIMENSION_STEP_RATIO));
    }

    // До цели не дожали (экзотика) — отправляем лучшее, пока влезает в серверный лимит.
    if (smallestBlob && smallestBlob.size <= UPLOAD_MAX_BYTES) {
      return blobToJpegFile(smallestBlob, namePrefix);
    }
    throw new Error(IMAGE_URL_FIELD_UI.ERROR_SIZE);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * @param {string} mimeType
 * @returns {boolean}
 */
function isDirectlyUploadableMimeType(mimeType) {
  return UPLOAD_ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Нормализует File перед `POST /upload`: исходник принимаем до 50 МБ,
 * но большие файлы (и HEIC/неизвестный MIME) автоматически пережимаются
 * в JPEG под целевой размер — на сервер большой оригинал не уходит.
 *
 * @param {File} file
 * @param {{ namePrefix?: string }} [options]
 * @returns {Promise<File>}
 */
export async function prepareBrowserImageFileForUpload(file, options = {}) {
  const namePrefix = options.namePrefix ?? "image";

  if (file.size > UPLOAD_IMAGE_SOURCE_MAX_BYTES) {
    throw new Error(IMAGE_URL_FIELD_UI.ERROR_SIZE);
  }

  const mimeType = resolveBrowserImageMimeType(file);
  const needsJpegConversion =
    isBrowserHeicImageFile(file) || !mimeType || !isDirectlyUploadableMimeType(mimeType);

  if (!needsJpegConversion && file.size <= UPLOAD_IMAGE_COMPRESS_TARGET_BYTES) {
    return file;
  }

  return compressBrowserImageFileToJpeg(file, namePrefix);
}
