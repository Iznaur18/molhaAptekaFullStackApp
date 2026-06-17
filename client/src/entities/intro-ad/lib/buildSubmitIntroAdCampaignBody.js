import { buildPatchAppIntroSettingsBody } from "../../app-intro-settings/lib/buildPatchAppIntroSettingsBody.js";

/**
 * @param {ReturnType<import('../../app-intro-settings/lib/mapAppIntroSettingsToForm.js').mapAppIntroSettingsToForm>} form
 */
export function buildSubmitIntroAdCampaignBody(form) {
  const body = buildPatchAppIntroSettingsBody(form);
  return {
    videoMp4Url: String(body.videoMp4Url ?? "").trim(),
    videoWebmUrl: body.videoWebmUrl ?? null,
    posterUrl: body.posterUrl ?? null,
    fallbackTitle: body.fallbackTitle ?? null,
    fallbackHint: body.fallbackHint ?? null,
    minMs: body.minMs,
    maxMs: body.maxMs,
    fadeOutMs: body.fadeOutMs,
  };
}

/**
 * @param {ReturnType<typeof buildSubmitIntroAdCampaignBody>} body
 */
export function formToIntroAdPreviewSettings(body) {
  return {
    videoMp4Url: body.videoMp4Url,
    videoWebmUrl: body.videoWebmUrl,
    posterUrl: body.posterUrl,
    fallbackTitle: body.fallbackTitle ?? "",
    fallbackHint: body.fallbackHint ?? "",
    minMs: body.minMs,
    maxMs: body.maxMs,
    fadeOutMs: body.fadeOutMs,
    updatedAt: null,
  };
}
