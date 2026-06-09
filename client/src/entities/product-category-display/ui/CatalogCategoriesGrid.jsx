import { useMemo } from "react";

import {
  PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
  buildResolvedProductCategoryDisplaysFromRoots,
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
 *   categoryRoots: import('../../product-category-tree/model/types.js').ProductCategoryNode[];
 *   onCategoryClick: (item: import('../model/types.js').ResolvedProductCategoryDisplay) => void;
 *   onEditCategoryClick: (categorySlug: string) => void;
 *   showSectionShell?: boolean;
 * }} props
 */
export function CatalogCategoriesGrid({
  displays,
  categoryRoots,
  isAdmin,
  isLoading,
  errorMessage,
  onCategoryClick,
  onEditCategoryClick,
  showSectionShell = true,
}) {
  const items = useMemo(
    () => buildResolvedProductCategoryDisplaysFromRoots(categoryRoots, displays),
    [categoryRoots, displays],
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
                onClick={() => onCategoryClick(item)}
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
