/**
 * Вырезает квадрат из natural-координат изображения в File.
 *
 * @param {HTMLImageElement} image
 * @param {{ sx: number; sy: number; size: number }} crop
 * @param {{ outputSize?: number; mimeType?: string; fileName?: string; quality?: number }} [options]
 * @returns {Promise<File>}
 */
export async function cropSquareImageToFile(image, crop, options = {}) {
  const outputSize = options.outputSize ?? 1024;
  const mimeType = options.mimeType || "image/jpeg";
  const quality = options.quality ?? 0.9;
  const fileName = options.fileName || "avatar-crop.jpg";

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas недоступен");
  }

  const sx = Math.max(0, Math.round(crop.sx));
  const sy = Math.max(0, Math.round(crop.sy));
  const maxSize = Math.min(image.naturalWidth - sx, image.naturalHeight - sy);
  const size = Math.max(1, Math.min(Math.round(crop.size), maxSize));

  context.drawImage(image, sx, sy, size, size, 0, 0, outputSize, outputSize);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (!nextBlob) {
          reject(new Error("Не удалось обработать изображение"));
          return;
        }
        resolve(nextBlob);
      },
      mimeType,
      quality,
    );
  });

  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

/**
 * Cover-scale: минимальный scale, при котором image полностью закрывает frame.
 *
 * @param {number} imageWidth
 * @param {number} imageHeight
 * @param {number} frameSize
 */
export function computeCoverScale(imageWidth, imageHeight, frameSize) {
  if (imageWidth <= 0 || imageHeight <= 0 || frameSize <= 0) {
    return 1;
  }
  return Math.max(frameSize / imageWidth, frameSize / imageHeight);
}

/**
 * @param {{
 *   imageWidth: number;
 *   imageHeight: number;
 *   frameSize: number;
 *   zoom: number;
 *   offsetX: number;
 *   offsetY: number;
 * }} params
 * @returns {{ sx: number; sy: number; size: number }}
 */
export function computeSquareCropFromViewport({
  imageWidth,
  imageHeight,
  frameSize,
  zoom,
  offsetX,
  offsetY,
}) {
  const coverScale = computeCoverScale(imageWidth, imageHeight, frameSize);
  const scale = coverScale * Math.max(1, zoom);
  const viewSize = frameSize / scale;
  const centerX = imageWidth / 2 - offsetX / scale;
  const centerY = imageHeight / 2 - offsetY / scale;
  const sx = clamp(centerX - viewSize / 2, 0, Math.max(0, imageWidth - viewSize));
  const sy = clamp(centerY - viewSize / 2, 0, Math.max(0, imageHeight - viewSize));
  return { sx, sy, size: viewSize };
}

/**
 * @param {number} imageWidth
 * @param {number} imageHeight
 * @param {number} frameSize
 * @param {number} zoom
 */
export function computeMaxPanOffset(imageWidth, imageHeight, frameSize, zoom) {
  const coverScale = computeCoverScale(imageWidth, imageHeight, frameSize);
  const scale = coverScale * Math.max(1, zoom);
  const displayedWidth = imageWidth * scale;
  const displayedHeight = imageHeight * scale;
  return {
    maxX: Math.max(0, (displayedWidth - frameSize) / 2),
    maxY: Math.max(0, (displayedHeight - frameSize) / 2),
  };
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
