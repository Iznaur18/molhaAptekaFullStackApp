import { USER_STORY_ASPECT_RATIO } from "../model/constants.js";

/**
 * @param {File} file
 * @param {number} [aspectRatio]
 * @returns {Promise<File>}
 */
export async function cropImageToAspectRatio(
  file,
  aspectRatio = USER_STORY_ASPECT_RATIO,
) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const { sx, sy, sw, sh } = computeCenterCropRect(
      image.width,
      image.height,
      aspectRatio,
    );

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas недоступен");
    }

    context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

    const blob = await canvasToBlob(canvas, file.type || "image/jpeg");
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";

    return new File([blob], `story-crop.${extension}`, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * @param {string} src
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Не удалось загрузить изображение"));
    image.src = src;
  });
}

/**
 * @param {number} width
 * @param {number} height
 * @param {number} aspectRatio width / height
 */
function computeCenterCropRect(width, height, aspectRatio) {
  const sourceRatio = width / height;

  if (sourceRatio > aspectRatio) {
    const sw = Math.round(height * aspectRatio);
    const sh = height;
    const sx = Math.round((width - sw) / 2);
    return { sx, sy: 0, sw, sh };
  }

  const sw = width;
  const sh = Math.round(width / aspectRatio);
  const sy = Math.round((height - sh) / 2);
  return { sx: 0, sy, sw, sh };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} type
 */
function canvasToBlob(canvas, type) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Не удалось обработать изображение"));
          return;
        }
        resolve(blob);
      },
      type || "image/jpeg",
      0.92,
    );
  });
}
