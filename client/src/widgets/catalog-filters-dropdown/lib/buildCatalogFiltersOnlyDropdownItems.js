import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_NEAR,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_SORT_OPTIONS,
  CATALOG_SORT_LABEL_RU,
  CATALOG_PUBLIC_FILTER_TOGGLE_KEYS,
} from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {'sort' | 'filter'} CatalogFiltersDropdownItemType */

/**
 * @typedef {(
 *   | {
 *       type: 'sort';
 *       key: string;
 *       value: string;
 *       label: string;
 *     }
 *   | {
 *       type: 'filter';
 *       key: string;
 *       value: string;
 *       label: string;
 *     }
 * )} CatalogFiltersDropdownItem
 */

/** @returns {CatalogFiltersDropdownItem[]} */
export function buildCatalogFiltersOnlyDropdownItems() {
  return [
    ...CATALOG_SORT_OPTIONS.map((sort) => ({
      type: "sort",
      key: `sort:${sort}`,
      value: sort,
      label: CATALOG_SORT_LABEL_RU[sort],
    })),
    ...CATALOG_PUBLIC_FILTER_TOGGLE_KEYS.map((filterKey) => ({
      type: "filter",
      key: `filter:${filterKey}`,
      value: filterKey,
      label: CATALOG_SORT_LABEL_RU[filterKey],
    })),
  ];
}

/**
 * @param {CatalogFiltersDropdownItem} item
 * @param {{
 *   catalogSort: string;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogInstallmentOnly: boolean;
 *   catalogSaleOnly: boolean;
 *   catalogNear: boolean;
 * }} state
 */
export function isCatalogFiltersDropdownItemSelected(item, state) {
  if (item.type === "sort") {
    return state.catalogSort === item.value;
  }
  if (item.value === CATALOG_FILTER_FOLLOWING_ONLY) {
    return state.catalogFollowingOnly;
  }
  if (item.value === CATALOG_FILTER_AUCTION_ONLY) {
    return state.catalogAuctionOnly;
  }
  if (item.value === CATALOG_FILTER_INSTALLMENT_ONLY) {
    return state.catalogInstallmentOnly;
  }
  if (item.value === CATALOG_FILTER_SALE_ONLY) {
    return state.catalogSaleOnly;
  }
  if (item.value === CATALOG_FILTER_NEAR) {
    return state.catalogNear;
  }
  return false;
}

export { HOME_PAGE_UI };
