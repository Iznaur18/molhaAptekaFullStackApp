import {
  APP_INTRO_FALLBACK_HINT_MAX_LENGTH,
  APP_INTRO_FALLBACK_TITLE_MAX_LENGTH,
} from "@molha/api-contract";

import { INTRO_AD_PAGE_UI } from "@/shared/config";

import type { IntroAdFormState } from "./mapIntroAdFormDefaults";

export const validateIntroAdForm = (form: IntroAdFormState): string | null => {
  const fallbackTitle = form.fallbackTitle.trim();
  if (!fallbackTitle) {
    return INTRO_AD_PAGE_UI.ERROR_FALLBACK_TITLE_REQUIRED;
  }
  if (fallbackTitle.length > APP_INTRO_FALLBACK_TITLE_MAX_LENGTH) {
    return INTRO_AD_PAGE_UI.ERROR_FALLBACK_TITLE_TOO_LONG;
  }

  const fallbackHint = form.fallbackHint.trim();
  if (!fallbackHint) {
    return INTRO_AD_PAGE_UI.ERROR_FALLBACK_HINT_REQUIRED;
  }
  if (fallbackHint.length > APP_INTRO_FALLBACK_HINT_MAX_LENGTH) {
    return INTRO_AD_PAGE_UI.ERROR_FALLBACK_HINT_TOO_LONG;
  }

  if (!form.videoMp4Url.trim()) {
    return INTRO_AD_PAGE_UI.ERROR_VIDEO_REQUIRED;
  }

  return null;
};
