import {
  APP_INTRO_FADE_OUT_MS_MAX,
  APP_INTRO_FADE_OUT_MS_MIN,
  APP_INTRO_FALLBACK_HINT_MAX_LENGTH,
  APP_INTRO_FALLBACK_TITLE_MAX_LENGTH,
  APP_INTRO_MAX_MS_MAX,
  APP_INTRO_MAX_MS_MIN,
  APP_INTRO_MIN_MS_MAX,
  APP_INTRO_MIN_MS_MIN,
} from "@molha/api-contract";

import { APP_INTRO_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {ReturnType<import('../../../entities/app-intro-settings/lib/mapAppIntroSettingsToForm.js').mapAppIntroSettingsToForm>} form
 * @returns {string | null}
 */
export function validateAppIntroAdminForm(form) {
  const fallbackTitle = String(form.fallbackTitle ?? "").trim();
  if (!fallbackTitle) {
    return APP_INTRO_ADMIN_PAGE_UI.ERROR_FALLBACK_TITLE_REQUIRED;
  }
  if (fallbackTitle.length > APP_INTRO_FALLBACK_TITLE_MAX_LENGTH) {
    return APP_INTRO_ADMIN_PAGE_UI.ERROR_FALLBACK_TITLE_TOO_LONG;
  }

  const fallbackHint = String(form.fallbackHint ?? "").trim();
  if (!fallbackHint) {
    return APP_INTRO_ADMIN_PAGE_UI.ERROR_FALLBACK_HINT_REQUIRED;
  }
  if (fallbackHint.length > APP_INTRO_FALLBACK_HINT_MAX_LENGTH) {
    return APP_INTRO_ADMIN_PAGE_UI.ERROR_FALLBACK_HINT_TOO_LONG;
  }

  const minMs = Number(form.minMs);
  const maxMs = Number(form.maxMs);
  const fadeOutMs = Number(form.fadeOutMs);

  if (
    !Number.isFinite(minMs) ||
    minMs < APP_INTRO_MIN_MS_MIN ||
    minMs > APP_INTRO_MIN_MS_MAX
  ) {
    return APP_INTRO_ADMIN_PAGE_UI.ERROR_MIN_MS;
  }
  if (
    !Number.isFinite(maxMs) ||
    maxMs < APP_INTRO_MAX_MS_MIN ||
    maxMs > APP_INTRO_MAX_MS_MAX
  ) {
    return APP_INTRO_ADMIN_PAGE_UI.ERROR_MAX_MS;
  }
  if (maxMs < minMs) {
    return APP_INTRO_ADMIN_PAGE_UI.ERROR_MAX_LT_MIN;
  }
  if (
    !Number.isFinite(fadeOutMs) ||
    fadeOutMs < APP_INTRO_FADE_OUT_MS_MIN ||
    fadeOutMs > APP_INTRO_FADE_OUT_MS_MAX
  ) {
    return APP_INTRO_ADMIN_PAGE_UI.ERROR_FADE_MS;
  }

  return null;
}
