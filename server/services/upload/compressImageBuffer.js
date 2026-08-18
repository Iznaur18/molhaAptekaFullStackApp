import sharp from "sharp";

/**
 * Фото товаров заливаются оригиналами (до ~2 МБ lossless PNG / полноразмерный
 * JPEG), из-за чего первый экран весит десятки МБ. Ужимаем к WebP с даунскейлом
 * по длинной стороне — типичный выигрыш ~10–15× без заметной потери качества.
 */
export const DEFAULT_IMAGE_MAX_DIM = 1600;
export const DEFAULT_IMAGE_WEBP_QUALITY = 80;

/**
 * @returns {{ maxDim: number, quality: number }}
 */
export function resolveImageCompressionSettings() {
  const rawMaxDim = Number(process.env.UPLOAD_IMAGE_MAX_DIM);
  const rawQuality = Number(process.env.UPLOAD_IMAGE_WEBP_QUALITY);

  return {
    maxDim:
      Number.isFinite(rawMaxDim) && rawMaxDim > 0
        ? Math.floor(rawMaxDim)
        : DEFAULT_IMAGE_MAX_DIM,
    quality:
      Number.isFinite(rawQuality) && rawQuality >= 1 && rawQuality <= 100
        ? Math.floor(rawQuality)
        : DEFAULT_IMAGE_WEBP_QUALITY,
  };
}

/**
 * Даунскейл (не апскейлит) + перекодировка в WebP. Возвращает `null`, если
 * результат не меньше оригинала — чтобы не «раздувать» уже лёгкие картинки
 * (мелкие иконки/логотипы, где WebP-обёртка тяжелее исходника).
 *
 * `.rotate()` без аргументов применяет EXIF-ориентацию до того, как metadata
 * будет отброшена — иначе фото с телефона «ложатся на бок».
 *
 * @param {Buffer} inputBuffer
 * @param {{ maxDim?: number, quality?: number }} [options]
 * @returns {Promise<Buffer | null>}
 */
export async function compressImageToWebp(inputBuffer, options = {}) {
  if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
    throw new Error("compressImageToWebp: пустой буфер");
  }

  const settings = resolveImageCompressionSettings();
  const maxDim = options.maxDim ?? settings.maxDim;
  const quality = options.quality ?? settings.quality;

  const output = await sharp(inputBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: maxDim,
      height: maxDim,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  if (output.length >= inputBuffer.length) {
    return null;
  }

  return output;
}
