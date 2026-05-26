/** Текущий вариант оформления шапки главной (увеличивай до «стоп»). */
export const HOME_HEADER_VARIANT = 1;

/**
 * @returns {string}
 */
export function getHomeHeaderVariantClass() {
  return `home-page__header--v${HOME_HEADER_VARIANT}`;
}

/**
 * @returns {string}
 */
export function getHomePageVariantClass() {
  return `home-page--header-v${HOME_HEADER_VARIANT}`;
}
