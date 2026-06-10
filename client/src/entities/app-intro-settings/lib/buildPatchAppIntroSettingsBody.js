/**
 * @param {ReturnType<import('./mapAppIntroSettingsToForm.js').mapAppIntroSettingsToForm>} form
 * @returns {import('../model/types.js').PatchAppIntroSettingsBody}
 */
export function buildPatchAppIntroSettingsBody(form) {
  const trimOrNull = (value) => {
    const trimmed = String(value ?? "").trim();
    return trimmed === "" ? null : trimmed;
  };

  return {
    videoMp4Url: trimOrNull(form.videoMp4Url),
    videoWebmUrl: trimOrNull(form.videoWebmUrl),
    posterUrl: trimOrNull(form.posterUrl),
    fallbackTitle: String(form.fallbackTitle ?? "").trim(),
    fallbackHint: String(form.fallbackHint ?? "").trim(),
    minMs: Number(form.minMs) || 0,
    maxMs: Number(form.maxMs) || 0,
    fadeOutMs: Number(form.fadeOutMs) || 0,
    prioritizePlatformIntro: Boolean(form.prioritizePlatformIntro),
  };
}
