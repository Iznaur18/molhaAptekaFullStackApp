import { useMemo } from "react";

import {
  PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
  buildResolvedProductCategoryDisplays,
} from "../lib/resolveProductCategoryDisplay.js";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { Pencil } from "../../../shared/ui/icon/index.js";

import "./CatalogCategoriesGrid.css";

/**
 * @param {{
 *   displays: import('../model/types.js').ProductCategoryDisplayFromApi[];
 *   isAdmin: boolean;
 *   isLoading: boolean;
 *   errorMessage: string | null;
 *   onCategoryClick: (categorySlug: import('../../product/model/types.js').ProductCategory) => void;
 *   onEditCategoryClick: (categorySlug: import('../../product/model/types.js').ProductCategory) => void;
 *   showSectionShell?: boolean;
 * }} props
 */
export function CatalogCategoriesGrid({
  displays,
  isAdmin,
  isLoading,
  errorMessage,
  onCategoryClick,
  onEditCategoryClick,
  showSectionShell = true,
}) {
  const items = useMemo(
    () => buildResolvedProductCategoryDisplays(displays),
    [displays],
  );

  if (isLoading) {
    const loading = (
      <p className="catalog-categories-grid__state">
        {PRODUCT_CATEGORY_DISPLAY_UI.LOADING}
      </p>
    );
    return showSectionShell ? (
      <section
        className="catalog-categories-grid"
        aria-label={PRODUCT_CATEGORY_DISPLAY_UI.GRID_ARIA}
      >
        {loading}
      </section>
    ) : (
      loading
    );
  }

  if (errorMessage) {
    const error = (
      <p
        className="catalog-categories-grid__state catalog-categories-grid__state_error"
        role="alert"
      >
        {errorMessage}
      </p>
    );
    return showSectionShell ? (
      <section
        className="catalog-categories-grid"
        aria-label={PRODUCT_CATEGORY_DISPLAY_UI.GRID_ARIA}
      >
        {error}
      </section>
    ) : (
      error
    );
  }

  const grid = (
    <ul className="catalog-categories-grid__list">
      {items.map((item) => {
        const imageSrc = item.imageUrl
          ? resolveUploadedImageUrl(item.imageUrl)
          : PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE;

        return (
          <li key={item.categorySlug} className="catalog-categories-grid__item">
            <div className="catalog-categories-grid__card-wrap">
              <button
                type="button"
                className="catalog-categories-grid__card"
                onClick={() => onCategoryClick(item.categorySlug)}
              >
                <span className="catalog-categories-grid__image-wrap">
                  <img
                    className="catalog-categories-grid__image"
                    src={imageSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="catalog-categories-grid__label">{item.label}</span>
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  className="catalog-categories-grid__edit"
                  aria-label={PRODUCT_CATEGORY_DISPLAY_UI.EDIT_ARIA(item.label)}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditCategoryClick(item.categorySlug);
                  }}
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );

  if (!showSectionShell) {
    return grid;
  }

  return (
    <section
      className="catalog-categories-grid"
      aria-label={PRODUCT_CATEGORY_DISPLAY_UI.GRID_ARIA}
    >
      {grid}
    </section>
  );
}
