import { COMMON_UI } from "../../../shared/config/appUiCopy.js";

const DATE_FORMAT = new Intl.DateTimeFormat(COMMON_UI.LOCALE_RU, {
  dateStyle: "medium",
});

/**
 * @param {string | undefined} iso
 */
export function formatPassportDate(iso) {
  if (iso == null || iso === "") return COMMON_UI.EM_DASH;
  try {
    return DATE_FORMAT.format(new Date(iso));
  } catch {
    return String(iso);
  }
}

/**
 * @param {import('../model/types.js').PassportSnapshot} passport
 */
export function formatPassportFullName(passport) {
  const parts = [
    passport.lastName,
    passport.firstName,
    passport.middleName?.trim(),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : COMMON_UI.EM_DASH;
}
