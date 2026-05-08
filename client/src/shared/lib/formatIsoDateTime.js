import { COMMON_UI } from "../config/appUiCopy.js";

const DATE_FORMAT = new Intl.DateTimeFormat(COMMON_UI.LOCALE_RU, {
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export const formatIsoDateTime = (iso) => {
  if (iso == null || iso === "") return COMMON_UI.EM_DASH;
  try {
    return DATE_FORMAT.format(new Date(iso));
  } catch {
    return String(iso);
  }
};
