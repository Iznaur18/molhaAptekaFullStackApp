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
    videoWebmUrl: null,
    posterUrl: trimOrNull(form.posterUrl),
    fallbackTitle: String(form.fallbackTitle ?? "").trim(),
    fallbackHint: String(form.fallbackHint ?? "").trim(),
    prioritizePlatformIntro: Boolean(form.prioritizePlatformIntro),
  };
}
