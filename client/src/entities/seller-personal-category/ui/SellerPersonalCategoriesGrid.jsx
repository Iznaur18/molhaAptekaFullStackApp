import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "../../product-category-display/lib/resolveProductCategoryDisplay.js";
import { SELLER_PERSONAL_CATEGORY_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

import "../../product-category-display/ui/CatalogCategoriesGrid.css";

/**
 * @param {{
 *   tiles: Array<{
 *     _id: string;
 *     sellerId: string;
 *     labelRu: string;
 *     imageUrl?: string | null;
 *   }>;
 *   isLoading: boolean;
 *   errorMessage: string | null;
 *   onTileClick: (tile: { _id: string; sellerId: string; labelRu: string }) => void;
 * }} props
 */
export function SellerPersonalCategoriesGrid({
  tiles,
  isLoading,
  errorMessage,
  onTileClick,
}) {
  if (isLoading) {
    return (
      <p className="catalog-categories-grid__state">
        {SELLER_PERSONAL_CATEGORY_PAGE_UI.TILES_LOADING}
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p
        className="catalog-categories-grid__state catalog-categories-grid__state_error"
        role="alert"
      >
        {errorMessage}
      </p>
    );
  }

  if (tiles.length === 0) {
    return null;
  }

  return (
    <ul className="catalog-categories-grid__list">
      {tiles.map((tile) => {
        // Своей картинки нет — заглушку рисует CSS, её фон идёт за темой.
        const isPlaceholder =
          !tile.imageUrl ||
          tile.imageUrl === PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE;
        const imageSrc = isPlaceholder ? "" : resolveUploadedImageUrl(tile.imageUrl);

        return (
          <li key={tile._id} className="catalog-categories-grid__item">
            <button
              type="button"
              className="catalog-categories-grid__card"
              onClick={() => onTileClick(tile)}
            >
              <span
                className={[
                  "catalog-categories-grid__image-wrap",
                  isPlaceholder && "catalog-categories-grid__image-wrap_placeholder",
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
              <span className="catalog-categories-grid__label">{tile.labelRu}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
