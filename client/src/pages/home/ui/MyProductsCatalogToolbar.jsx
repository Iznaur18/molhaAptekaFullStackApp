import { formatSellerProductsQuota } from "../../../entities/product/lib/sellerProductsLimit.js";
import {
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_OPTIONS_MY_PRODUCTS,
  MY_PRODUCTS_MODERATION_FILTER_OPTIONS,
  MY_PRODUCTS_MODERATION_FILTER_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  ListPageFilter,
  ListPageFilterBar,
  ListPageFilterSelect,
} from "../../../shared/ui/ListPageFilterBar/ListPageFilterBar.jsx";

import "./MyProductsCatalogToolbar.css";

/**
 * @param {{
 *   catalogSort: string;
 *   onCatalogSortChange: (value: string) => void;
 *   isAdmin: boolean;
 *   myProductsTotal: number | null;
 *   sellerProductsLimit: number | null;
 *   myProductsModerationFilter?: string;
 *   onMyProductsModerationFilterChange?: (value: string) => void;
 * }} props
 */
export function MyProductsCatalogToolbar({
  catalogSort,
  onCatalogSortChange,
  isAdmin,
  myProductsTotal,
  sellerProductsLimit,
  myProductsModerationFilter = "",
  onMyProductsModerationFilterChange,
}) {
  const showProductsQuota = sellerProductsLimit != null && !isAdmin;
  const productsQuotaText =
    showProductsQuota && sellerProductsLimit != null
      ? formatSellerProductsQuota(myProductsTotal, sellerProductsLimit)
      : null;

  return (
    <ListPageFilterBar className="my-products-catalog-toolbar">
      <ListPageFilter label={HOME_PAGE_UI.SORT_LABEL}>
        <ListPageFilterSelect
          value={catalogSort}
          onChange={(event) => onCatalogSortChange(event.target.value)}
        >
          {CATALOG_SORT_OPTIONS_MY_PRODUCTS.map((optionKey) => (
            <option key={optionKey} value={optionKey}>
              {CATALOG_SORT_LABEL_RU[optionKey]}
            </option>
          ))}
        </ListPageFilterSelect>
      </ListPageFilter>
      {typeof onMyProductsModerationFilterChange === "function" ? (
        <ListPageFilter label={HOME_PAGE_UI.MODERATION_STATUS_FILTER_LABEL}>
          <ListPageFilterSelect
            value={myProductsModerationFilter}
            onChange={(event) =>
              onMyProductsModerationFilterChange(event.target.value)
            }
          >
            {MY_PRODUCTS_MODERATION_FILTER_OPTIONS.map((filterKey) => (
              <option key={filterKey || "all"} value={filterKey}>
                {MY_PRODUCTS_MODERATION_FILTER_LABEL_RU[filterKey]}
              </option>
            ))}
          </ListPageFilterSelect>
        </ListPageFilter>
      ) : null}
      {productsQuotaText ? (
        <p
          className="my-products-catalog-toolbar__quota"
          aria-label={`${HOME_PAGE_UI.MY_PRODUCTS_QUOTA_LABEL}: ${productsQuotaText}`}
        >
          <span className="my-products-catalog-toolbar__quota-label">
            {HOME_PAGE_UI.MY_PRODUCTS_QUOTA_LABEL}:
          </span>{" "}
          <span className="my-products-catalog-toolbar__quota-value">
            {productsQuotaText}
          </span>
        </p>
      ) : null}
    </ListPageFilterBar>
  );
}
