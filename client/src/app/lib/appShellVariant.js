/** Текущий вариант оформления шапки главной (увеличивай до «стоп»). */
export const HOME_HEADER_VARIANT = 1;

/**
 * @returns {string}
 */
export function getAppShellHeaderVariantClass() {
  return `app-shell__header--v${HOME_HEADER_VARIANT}`;
}

/**
 * @returns {string}
 */
export function getAppShellVariantClass() {
  return `app-shell--header-v${HOME_HEADER_VARIANT}`;
}
