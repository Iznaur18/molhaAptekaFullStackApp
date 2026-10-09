import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { formatSellerProductsQuota } from "../../../entities/product/lib/sellerProductsLimit.js";
import {
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_OPTIONS_MY_PRODUCTS,
  MY_PRODUCTS_MODERATION_FILTER_OPTIONS,
  MY_PRODUCTS_MODERATION_FILTER_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { useMySellerStorePauseQuery } from "../../../entities/seller-store-pause/model/sellerStorePauseQueries.js";
import { SellerStorePauseControl } from "../../../entities/seller-store-pause/ui/SellerStorePauseControl.jsx";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./MyProductsCatalogToolbar.css";

/**
 * Тулбар «Моих товаров» в одну строку: фильтр — лента чипов, сортировка —
 * кнопка со стрелками (под ней системный список), счётчик товаров и «Скрыть
 * все товары» — в меню «⋯». Включённая пауза магазина показывается плашкой
 * под строкой.
 *
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const { data: storePause } = useMySellerStorePauseQuery();

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    /** @param {PointerEvent} event */
    const closeOnOutsidePress = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(/** @type {Node} */ (event.target))
      ) {
        setIsMenuOpen(false);
      }
    };
    /** @param {KeyboardEvent} event */
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  const showProductsQuota = sellerProductsLimit != null && !isAdmin;
  const productsQuotaText =
    showProductsQuota && sellerProductsLimit != null
      ? formatSellerProductsQuota(myProductsTotal, sellerProductsLimit)
      : null;

  const canPauseStore =
    storePause != null && !storePause.paused && storePause.visibleProductCount > 0;
  const hasMenu = productsQuotaText != null || canPauseStore;
  const hasStatusFilter = typeof onMyProductsModerationFilterChange === "function";

  return (
    <div className="my-products-catalog-toolbar">
      <div className="my-products-catalog-toolbar__row">
        {hasStatusFilter ? (
          <div
            className="my-products-catalog-toolbar__chips"
            role="group"
            aria-label={HOME_PAGE_UI.MODERATION_STATUS_FILTER_LABEL}
          >
            {MY_PRODUCTS_MODERATION_FILTER_OPTIONS.map((filterKey) => {
              const isActive = filterKey === myProductsModerationFilter;
              return (
                <button
                  key={filterKey || "all"}
                  type="button"
                  className={[
                    "my-products-catalog-toolbar__chip",
                    isActive ? "my-products-catalog-toolbar__chip_active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={isActive}
                  onClick={() => onMyProductsModerationFilterChange(filterKey)}
                >
                  {MY_PRODUCTS_MODERATION_FILTER_LABEL_RU[filterKey]}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="my-products-catalog-toolbar__spacer" />
        )}

        {/* Системный список лежит поверх иконки: нажатие открывает родной выбор. */}
        <label
          className="my-products-catalog-toolbar__icon-button"
          title={`${HOME_PAGE_UI.SORT_LABEL}: ${CATALOG_SORT_LABEL_RU[catalogSort] ?? ""}`}
        >
          <ArrowUpDown size={18} strokeWidth={2.2} aria-hidden="true" />
          <select
            className="my-products-catalog-toolbar__sort-select"
            aria-label={HOME_PAGE_UI.SORT_LABEL}
            value={catalogSort}
            onChange={(event) => onCatalogSortChange(event.target.value)}
          >
            {CATALOG_SORT_OPTIONS_MY_PRODUCTS.map((sortKey) => (
              <option key={sortKey} value={sortKey}>
                {CATALOG_SORT_LABEL_RU[sortKey]}
              </option>
            ))}
          </select>
        </label>

        {hasMenu ? (
          <div className="my-products-catalog-toolbar__menu-anchor" ref={menuRef}>
            <button
              type="button"
              className="my-products-catalog-toolbar__icon-button"
              aria-label={HOME_PAGE_UI.MY_PRODUCTS_MORE_MENU_ARIA}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <MoreHorizontal size={18} strokeWidth={2.2} aria-hidden="true" />
            </button>
            {isMenuOpen ? (
              <div className="my-products-catalog-toolbar__menu">
                {productsQuotaText ? (
                  <p
                    className="my-products-catalog-toolbar__quota"
                    aria-label={`${HOME_PAGE_UI.MY_PRODUCTS_QUOTA_LABEL}: ${productsQuotaText}`}
                  >
                    <span className="my-products-catalog-toolbar__quota-label">
                      {HOME_PAGE_UI.MY_PRODUCTS_QUOTA_LABEL}
                    </span>
                    <span className="my-products-catalog-toolbar__quota-value">
                      {productsQuotaText}
                    </span>
                  </p>
                ) : null}
                <SellerStorePauseControl mode="action" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <SellerStorePauseControl mode="banner" />
    </div>
  );
}
