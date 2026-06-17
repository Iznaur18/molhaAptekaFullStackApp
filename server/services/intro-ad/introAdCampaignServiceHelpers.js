import { AppError } from "../../errors/AppError.js";
import { assertIntroAdMediaUrlsAreUploadedAssets } from "./validateIntroAdMediaUrls.js";

/**
 * @param {Record<string, unknown>} body
 */
export const normalizeIntroAdMediaBody = (body) => {
  const videoMp4Url = String(body.videoMp4Url ?? "").trim();
  if (!videoMp4Url) {
    throw new AppError(400, "Загрузите MP4-ролик");
  }

  const normalizeOptional = (value) => {
    if (value == null || String(value).trim() === "") {
      return null;
    }
    return String(value).trim();
  };

  return {
    videoMp4Url,
    videoWebmUrl: normalizeOptional(body.videoWebmUrl),
    posterUrl: normalizeOptional(body.posterUrl),
    fallbackTitle: String(body.fallbackTitle ?? "").trim(),
    fallbackHint: String(body.fallbackHint ?? "").trim(),
    minMs: body.minMs,
    maxMs: body.maxMs,
    fadeOutMs: body.fadeOutMs,
  };
};

/**
 * @param {Record<string, unknown>} body
 */
export const parseIntroAdMediaBody = (body) => {
  try {
    const media = normalizeIntroAdMediaBody(body);
    assertIntroAdMediaUrlsAreUploadedAssets(media);
    return media;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error && error.message === "INTRO_AD_MEDIA_URL_INVALID") {
      throw new AppError(400, "Используйте файлы, загруженные через сайт");
    }
    throw error;
  }
};
