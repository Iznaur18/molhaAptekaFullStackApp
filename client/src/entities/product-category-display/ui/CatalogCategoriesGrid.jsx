import { useMemo } from "react";

import {
  PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
  buildResolvedProductCategoryDisplaysFromRoots,
} from "../lib/resolveProductCategoryDisplay.js";
import { useCategoryTileImagesMode } from "../model/useCategoryTileImages.js";
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
 *   pendingCategoryKey?: string | null;
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
  pendingCategoryKey = null,
  showSectionShell = true,
}) {
  const items = useMemo(
    () => buildResolvedProductCategoryDisplaysFromRoots(categoryRoots, displays),
    [categoryRoots, displays],
  );
  const tileImagesMode = useCategoryTileImagesMode();

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
    <ul
      className={[
        "catalog-categories-grid__list",
        tileImagesMode === "off" && "catalog-categories-grid__list_text",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item) => {
        // Своей картинки нет — заглушку рисует CSS: её фон идёт за темой
        // (тёмный в тёмной), а зашитая в картинку светлая подложка — нет.
        const isPlaceholder =
          !item.imageUrl ||
          item.imageUrl === PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE;
        const imageSrc = isPlaceholder ? "" : resolveUploadedImageUrl(item.imageUrl);

        return (
          <li key={item.categorySlug} className="catalog-categories-grid__item">
            <div className="catalog-categories-grid__card-wrap">
              <button
                type="button"
                className={[
                  "catalog-categories-grid__card",
                  pendingCategoryKey === (item.categoryId ?? item.categorySlug) &&
                    "catalog-categories-grid__card_pending",
                  tileImagesMode === "off" && "catalog-categories-grid__card_text",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={Boolean(pendingCategoryKey)}
                onClick={() => onCategoryClick(item)}
              >
                {tileImagesMode === "on" ? (
                  <span
                    className={[
                      "catalog-categories-grid__image-wrap",
                      isPlaceholder &&
                        "catalog-categories-grid__image-wrap_placeholder",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isPlaceholder ? null : (
                      <img
                        className="catalog-categories-grid__image"
                        src={imageSrc}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </span>
                ) : null}
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
