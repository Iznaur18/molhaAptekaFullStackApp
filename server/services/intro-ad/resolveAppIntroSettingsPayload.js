import {
  APP_INTRO_FADE_OUT_MS_DEFAULT,
  APP_INTRO_FALLBACK_HINT_DEFAULT,
  APP_INTRO_FALLBACK_TITLE_DEFAULT,
  APP_INTRO_MAX_MS_DEFAULT,
  APP_INTRO_MIN_MS_DEFAULT,
} from "../../constants/appIntroSettingsConstants.js";

/**
 * @param {Record<string, unknown> | null | undefined} row
 */
export const resolveAppIntroSettingsPayload = (row) => {
  const fallbackTitle =
    typeof row?.fallbackTitle === "string" && row.fallbackTitle.trim()
      ? row.fallbackTitle.trim()
      : APP_INTRO_FALLBACK_TITLE_DEFAULT;
  const fallbackHint =
    typeof row?.fallbackHint === "string" && row.fallbackHint.trim()
      ? row.fallbackHint.trim()
      : APP_INTRO_FALLBACK_HINT_DEFAULT;

  return {
    videoMp4Url:
      typeof row?.videoMp4Url === "string" && row.videoMp4Url.trim()
        ? row.videoMp4Url.trim()
        : null,
    videoWebmUrl:
      typeof row?.videoWebmUrl === "string" && row.videoWebmUrl.trim()
        ? row.videoWebmUrl.trim()
        : null,
    posterUrl:
      typeof row?.posterUrl === "string" && row.posterUrl.trim()
        ? row.posterUrl.trim()
        : null,
    fallbackTitle,
    fallbackHint,
    minMs: Number(row?.minMs) > 0 ? Number(row.minMs) : APP_INTRO_MIN_MS_DEFAULT,
    maxMs: Number(row?.maxMs) > 0 ? Number(row.maxMs) : APP_INTRO_MAX_MS_DEFAULT,
    fadeOutMs:
      Number(row?.fadeOutMs) > 0
        ? Number(row.fadeOutMs)
        : APP_INTRO_FADE_OUT_MS_DEFAULT,
    prioritizePlatformIntro: row?.prioritizePlatformIntro === true,
    updatedAt: row?.updatedAt ?? null,
  };
};
