import { APP_INTRO_SETTINGS_KEY } from "../../constants/appIntroSettingsConstants.js";
import { AppIntroSettingsModel } from "../../models/AppIntroSettingsModel.js";
import { cleanupReplacedAppIntroMedia } from "../../utils/cleanupReplacedAppIntroMedia.js";
import {
  pauseActiveIntroAdCampaignsForPlatformIntro,
  resolvePaidIntroForPublicPlayback,
  resumePausedIntroAdCampaigns,
} from "../../utils/introAdCampaignHelpers.js";
import { resolveAppIntroSettingsPayload } from "../../utils/resolveAppIntroSettingsPayload.js";
import { errorRes, successRes } from "../../utils/index.js";

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
  try {
    const row = await AppIntroSettingsModel.findOne({
      settingsKey: APP_INTRO_SETTINGS_KEY,
    }).lean();

    const settings = resolveAppIntroSettingsPayload(row);
    const paidIntro = await resolvePaidIntroForPublicPlayback(settings.prioritizePlatformIntro);

    return successRes(res, {
      settings,
      paidIntro,
    });
  } catch (error) {
    console.error("getAppIntroSettingsController error:", error);
    return errorRes(res, 500, "Не удалось загрузить настройки intro");
  }
};

/** PATCH /app-intro — только admin. */
export const patchAppIntroSettingsController = async (req, res) => {
  try {
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
    }

    const nextVideoWebmUrl = normalizeOptionalMediaUrl(body.videoWebmUrl);
    if (nextVideoWebmUrl !== undefined) {
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

    if (saved?.prioritizePlatformIntro === true) {
      await pauseActiveIntroAdCampaignsForPlatformIntro();
    } else if (body.prioritizePlatformIntro === false) {
      await resumePausedIntroAdCampaigns();
    }

    const settings = resolveAppIntroSettingsPayload(saved);
    const paidIntro = await resolvePaidIntroForPublicPlayback(settings.prioritizePlatformIntro);

    return successRes(res, {
      settings,
      paidIntro,
    });
  } catch (error) {
    console.error("patchAppIntroSettingsController error:", error);
    return errorRes(res, 500, "Не удалось сохранить настройки intro");
  }
};
