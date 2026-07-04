/**
 * Загрузка видео для сторис (`/upload/video?purpose=story`):
 * повышенный лимит исходника, сервер обрезает до 30 сек и пережимает файл.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export function isStoryVideoUploadRequest(req) {
  return String(req?.query?.purpose ?? "").trim() === "story";
}
