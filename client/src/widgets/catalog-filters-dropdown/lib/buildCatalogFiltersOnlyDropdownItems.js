import {
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
 *   catalogSaleOnly: boolean;
 * }} state
 */
export function isCatalogFiltersDropdownItemSelected(item, state) {
  if (item.type === "sort") {
    return state.catalogSort === item.value;
  }
  if (item.value === "followingOnly") {
    return state.catalogFollowingOnly;
  }
  if (item.value === "auctionOnly") {
    return state.catalogAuctionOnly;
  }
  if (item.value === "saleOnly") {
    return state.catalogSaleOnly;
  }
  return false;
}

export { HOME_PAGE_UI };
