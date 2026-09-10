import {
  MY_PRODUCTS_LIST_FILTER_APPROVED,
  MY_PRODUCTS_LIST_FILTER_HIDDEN,
  MY_PRODUCTS_LIST_FILTER_NOT_PROMOTED,
  MY_PRODUCTS_LIST_FILTER_PENDING,
  MY_PRODUCTS_LIST_FILTER_PROMOTED,
  MY_PRODUCTS_LIST_FILTER_REJECTED,
  MY_PRODUCTS_LIST_FILTER_VALUES,
} from "../../constants/productModerationConstants.js";

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function parseMyProductsListFilter(raw) {
  if (raw == null || String(raw).trim() === "") {
    return null;
  }
  const value = String(raw).trim();
  return MY_PRODUCTS_LIST_FILTER_VALUES.includes(value) ? value : null;
}

/**
 * @param {{
 *   listFilter: string | null;
 *   now?: Date;
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildMyProductsListFilterQuery({ listFilter, now = new Date() } = {}) {
  if (!listFilter) {
    return {};
  }

  if (
    listFilter === MY_PRODUCTS_LIST_FILTER_PENDING ||
    listFilter === MY_PRODUCTS_LIST_FILTER_APPROVED ||
    listFilter === MY_PRODUCTS_LIST_FILTER_REJECTED
  ) {
    return { productModerationStatus: listFilter };
  }

  if (listFilter === MY_PRODUCTS_LIST_FILTER_HIDDEN) {
    return { productIsAvailable: false };
  }

  if (listFilter === MY_PRODUCTS_LIST_FILTER_PROMOTED) {
    return { catalogPromotionExpiresAt: { $gt: now } };
  }

  if (listFilter === MY_PRODUCTS_LIST_FILTER_NOT_PROMOTED) {
    return {
      $or: [
        { catalogPromotionExpiresAt: null },
        { catalogPromotionExpiresAt: { $exists: false } },
        { catalogPromotionExpiresAt: { $lte: now } },
      ],
    };
  }

  return {};
}

/**
 * Фильтр «Скрыты» сам показывает unavailable — OneC-exclude не нужен.
 *
 * @param {string | null} listFilter
 */
export function shouldExcludeHiddenOneCFromMyProducts(listFilter) {
  return listFilter !== MY_PRODUCTS_LIST_FILTER_HIDDEN;
}
