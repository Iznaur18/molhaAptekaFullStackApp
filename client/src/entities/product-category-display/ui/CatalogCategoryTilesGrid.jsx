import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "../lib/resolveProductCategoryDisplay.js";
import { useCategoryTileImagesMode } from "../model/useCategoryTileImages.js";
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
 *   disabled?: boolean;
 * }} props
 */
export function CatalogCategoryTilesGrid({
  items,
  isAdmin = false,
  disabled = false,
  onTileClick,
  onEditTileClick,
  getEditAriaLabel = (item) => PRODUCT_CATEGORY_DISPLAY_UI.EDIT_ARIA(item.label),
  pendingTileKey = null,
}) {
  const isInteractionLocked = Boolean(pendingTileKey) || disabled;
  const tileImagesMode = useCategoryTileImagesMode();

  return (
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
        const isPending = pendingTileKey === item.categoryId;

        return (
          <li key={item.key} className="catalog-categories-grid__item">
            <div className="catalog-categories-grid__card-wrap">
              <button
                type="button"
                className={[
                  "catalog-categories-grid__card",
                  isPending && "catalog-categories-grid__card_pending",
                  tileImagesMode === "off" && "catalog-categories-grid__card_text",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isInteractionLocked}
                onClick={() => onTileClick(item)}
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
              {isAdmin &&
              onEditTileClick &&
              item.isEditable !== false &&
              item.categoryId ? (
                <button
                  type="button"
                  className="catalog-categories-grid__edit"
                  aria-label={getEditAriaLabel(item)}
                  disabled={disabled}
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
