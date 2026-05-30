import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_PUBLIC_FILTER_TOGGLE_KEYS,
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_OPTIONS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {'category' | 'sort' | 'filter'} CatalogFilterDropdownItemType */

/**
 * @typedef {(
 *   | {
 *       type: 'category';
 *       key: string;
 *       value: import('../../../entities/product/model/types.js').ProductCategory | null;
 *       label: string;
 *     }
 *   | {
 *       type: 'sort';
 *       key: string;
 *       value: string;
 *       label: string;
 *     }
 *   | {
 *       type: 'filter';
 *       key: string;
 *       value: typeof CATALOG_FILTER_FOLLOWING_ONLY | typeof CATALOG_FILTER_AUCTION_ONLY | typeof CATALOG_FILTER_SALE_ONLY;
 *       label: string;
 *     }
 * )} CatalogFilterDropdownItem
 */

/** @returns {CatalogFilterDropdownItem[]} */
export function buildCatalogFilterDropdownItems() {
  /** @type {CatalogFilterDropdownItem[]} */
  const items = [
    {
      type: "category",
      key: "category:all",
      value: null,
      label: HOME_PAGE_UI.CATEGORY_ALL,
    },
    ...PRODUCT_CATEGORIES.map((category) => ({
      type: "category",
      key: `category:${category}`,
      value: category,
      label: PRODUCT_CATEGORY_LABEL_RU[category],
    })),
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

  return items;
}

/**
 * @param {CatalogFilterDropdownItem} item
 * @param {{
 *   selectedProductCategory: import('../../../entities/product/model/types.js').ProductCategory | null;
 *   catalogSort: string;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogSaleOnly: boolean;
 * }} state
 */
export function isCatalogFilterDropdownItemSelected(item, state) {
  if (item.type === "category") {
    return state.selectedProductCategory === item.value;
  }
  if (item.type === "sort") {
    return (
      !state.catalogFollowingOnly &&
      !state.catalogAuctionOnly &&
      !state.catalogSaleOnly &&
      state.catalogSort === item.value
    );
  }
  if (item.value === CATALOG_FILTER_FOLLOWING_ONLY) {
    return state.catalogFollowingOnly;
  }
  if (item.value === CATALOG_FILTER_SALE_ONLY) {
    return state.catalogSaleOnly;
  }
  return state.catalogAuctionOnly;
}
