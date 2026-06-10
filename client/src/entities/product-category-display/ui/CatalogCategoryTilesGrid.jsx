import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "../lib/resolveProductCategoryDisplay.js";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { Pencil } from "../../../shared/ui/icon/index.js";

import "../ui/CatalogCategoriesGrid.css";

/**
 * @typedef {Object} CatalogCategoryTileItem
 * @property {string} key
 * @property {string} label
 * @property {string | null} [imageUrl]
 * @property {string} [categoryId]
 * @property {boolean} [isEditable]
 */

/**
 * @param {{
 *   items: CatalogCategoryTileItem[];
 *   isAdmin?: boolean;
 *   onTileClick: (item: CatalogCategoryTileItem) => void;
 *   onEditTileClick?: (item: CatalogCategoryTileItem) => void;
 *   getEditAriaLabel?: (item: CatalogCategoryTileItem) => string;
 *   pendingTileKey?: string | null;
 * }} props
 */
export function CatalogCategoryTilesGrid({
  items,
  isAdmin = false,
  onTileClick,
  onEditTileClick,
  getEditAriaLabel = (item) => PRODUCT_CATEGORY_DISPLAY_UI.EDIT_ARIA(item.label),
  pendingTileKey = null,
}) {
  const isInteractionLocked = Boolean(pendingTileKey);

  return (
    <ul className="catalog-categories-grid__list">
      {items.map((item) => {
        const imageSrc = item.imageUrl
          ? resolveUploadedImageUrl(item.imageUrl)
          : PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE;
        const isPending = pendingTileKey === item.categoryId;

        return (
          <li key={item.key} className="catalog-categories-grid__item">
            <div className="catalog-categories-grid__card-wrap">
              <button
                type="button"
                className={[
                  "catalog-categories-grid__card",
                  isPending && "catalog-categories-grid__card_pending",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isInteractionLocked}
                onClick={() => onTileClick(item)}
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
              {isAdmin && onEditTileClick && item.isEditable !== false && item.categoryId ? (
                <button
                  type="button"
                  className="catalog-categories-grid__edit"
                  aria-label={getEditAriaLabel(item)}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditTileClick(item);
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
}
