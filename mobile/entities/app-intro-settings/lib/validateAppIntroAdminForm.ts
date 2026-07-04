import {
  APP_INTRO_FALLBACK_HINT_MAX_LENGTH,
  APP_INTRO_FALLBACK_TITLE_MAX_LENGTH,
} from "@molha/api-contract";

import { APP_INTRO_ADMIN_PAGE_UI } from "@/shared/config";

import type { AppIntroAdminForm } from "./appIntroAdminForm";

export const validateAppIntroAdminForm = (form: AppIntroAdminForm): string | null => {
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

  return null;
};
