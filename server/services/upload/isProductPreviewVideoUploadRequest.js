/**
 * Загрузка превью-видео товара (`/upload/video?purpose=product-preview`):
 * повышенный лимит исходника, сервер обрезает до 3 сек и пережимает файл.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export function isProductPreviewVideoUploadRequest(req) {
  return String(req?.query?.purpose ?? "").trim() === "product-preview";
}
