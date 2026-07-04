/**
 * Загрузка видео для intro-ролика (`/upload/video?purpose=intro`):
 * повышенный лимит исходника, сервер обрезает и пережимает файл.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export function isIntroVideoUploadRequest(req) {
  return String(req?.query?.purpose ?? "").trim() === "intro";
}
