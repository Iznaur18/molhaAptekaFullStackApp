import { APP_INTRO_SETTINGS_KEY } from "../../constants/appIntroSettingsConstants.js";
import { AppIntroSettingsModel } from "../../models/AppIntroSettingsModel.js";
import { cleanupReplacedAppIntroMedia } from "../../services/intro-ad/cleanupReplacedAppIntroMedia.js";
import { resolvePaidIntrosForPublicPlayback } from "../../services/intro-ad/introAdCampaignHelpers.js";
import { resolveAppIntroSettingsPayload } from "../../services/intro-ad/resolveAppIntroSettingsPayload.js";
import { successRes } from "../../services/http/index.js";

/**
 * @param {string | null | undefined} value
 */
const normalizeOptionalMediaUrl = (value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value == null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
};

/** GET /app-intro */
export const getAppIntroSettingsController = async (_req, res) => {
  const row = await AppIntroSettingsModel.findOne({
    settingsKey: APP_INTRO_SETTINGS_KEY,
  }).lean();

  const settings = resolveAppIntroSettingsPayload(row);
  const paidIntros = await resolvePaidIntrosForPublicPlayback();

  return successRes(res, {
    settings,
    paidIntro: paidIntros[0] ?? null,
    paidIntros,
  });
};

/** PATCH /app-intro — только admin. */
export const patchAppIntroSettingsController = async (req, res) => {
  const existing = await AppIntroSettingsModel.findOne({
    settingsKey: APP_INTRO_SETTINGS_KEY,
  }).lean();

  const body = req.body ?? {};
  /** @type {Record<string, unknown>} */
  const update = { updatedBy: req.userId };

  let mediaChanged = false;

  const nextVideoMp4Url = normalizeOptionalMediaUrl(body.videoMp4Url);
  if (nextVideoMp4Url !== undefined) {
    await cleanupReplacedAppIntroMedia(existing?.videoMp4Url, nextVideoMp4Url);
    update.videoMp4Url = nextVideoMp4Url;
    mediaChanged = true;

    const previousVideoMp4Url = normalizeOptionalMediaUrl(existing?.videoMp4Url) ?? null;
    if (nextVideoMp4Url !== previousVideoMp4Url) {
      await cleanupReplacedAppIntroMedia(existing?.videoWebmUrl, null);
      update.videoWebmUrl = null;
    }
  }

  const nextVideoWebmUrl = normalizeOptionalMediaUrl(body.videoWebmUrl);
  if (nextVideoWebmUrl !== undefined && update.videoWebmUrl === undefined) {
    await cleanupReplacedAppIntroMedia(existing?.videoWebmUrl, nextVideoWebmUrl);
    update.videoWebmUrl = nextVideoWebmUrl;
    mediaChanged = true;
  }

  const nextPosterUrl = normalizeOptionalMediaUrl(body.posterUrl);
  if (nextPosterUrl !== undefined) {
    await cleanupReplacedAppIntroMedia(existing?.posterUrl, nextPosterUrl);
    update.posterUrl = nextPosterUrl;
    mediaChanged = true;
  }

  if (body.fallbackTitle !== undefined) {
    update.fallbackTitle =
      body.fallbackTitle == null || String(body.fallbackTitle).trim() === ""
        ? null
        : String(body.fallbackTitle).trim();
  }
  if (body.fallbackHint !== undefined) {
    update.fallbackHint =
      body.fallbackHint == null || String(body.fallbackHint).trim() === ""
        ? null
        : String(body.fallbackHint).trim();
  }
  if (body.minMs !== undefined) {
    update.minMs = body.minMs;
  }
  if (body.maxMs !== undefined) {
    update.maxMs = body.maxMs;
  }
  if (body.fadeOutMs !== undefined) {
    update.fadeOutMs = body.fadeOutMs;
  }

  if (body.prioritizePlatformIntro !== undefined) {
    update.prioritizePlatformIntro = Boolean(body.prioritizePlatformIntro);
  } else if (mediaChanged) {
    update.prioritizePlatformIntro = true;
  }

  const saved = await AppIntroSettingsModel.findOneAndUpdate(
    { settingsKey: APP_INTRO_SETTINGS_KEY },
    { $set: update },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  const settings = resolveAppIntroSettingsPayload(saved);
  const paidIntros = await resolvePaidIntrosForPublicPlayback();

  return successRes(res, {
    settings,
    paidIntro: paidIntros[0] ?? null,
    paidIntros,
  });
};
