import { IMAGE_URL_FIELD_UI } from "../config/appUiCopy.js";
import { UPLOAD_ALLOWED_MIME_TYPES, UPLOAD_MAX_BYTES } from "../config/uploadConstants.js";

import {
  isBrowserHeicImageFile,
  resolveBrowserImageMimeType,
} from "./resolveBrowserImageMimeType.js";

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
 * @param {File} file
 * @param {string} [namePrefix]
 * @returns {Promise<File>}
 */
async function convertBrowserImageFileToJpeg(file, namePrefix = "image") {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error(IMAGE_URL_FIELD_UI.ERROR_TYPE);
    }

    context.drawImage(image, 0, 0);

    const blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
    if (blob.size > UPLOAD_MAX_BYTES) {
      throw new Error(IMAGE_URL_FIELD_UI.ERROR_SIZE);
    }

    return new File([blob], `${namePrefix}-${Date.now()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
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
 * Нормализует File перед `validateUploadImageFile` / `POST /upload`.
 * iOS Safari отдаёт HEIC или пустой MIME — пережимаем в JPEG через canvas.
 *
 * @param {File} file
 * @param {{ namePrefix?: string }} [options]
 * @returns {Promise<File>}
 */
export async function prepareBrowserImageFileForUpload(file, options = {}) {
  const namePrefix = options.namePrefix ?? "image";
  const mimeType = resolveBrowserImageMimeType(file);

  if (isBrowserHeicImageFile(file) || (mimeType && !isDirectlyUploadableMimeType(mimeType))) {
    return convertBrowserImageFileToJpeg(file, namePrefix);
  }

  if (!mimeType) {
    return convertBrowserImageFileToJpeg(file, namePrefix);
  }

  if (file.size > UPLOAD_MAX_BYTES) {
    throw new Error(IMAGE_URL_FIELD_UI.ERROR_SIZE);
  }

  return file;
}
