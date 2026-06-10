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
        const imageSrc = tile.imageUrl
          ? resolveUploadedImageUrl(tile.imageUrl)
          : PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE;

        return (
          <li key={tile._id} className="catalog-categories-grid__item">
            <button
              type="button"
              className="catalog-categories-grid__card"
              onClick={() => onTileClick(tile)}
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
              <span className="catalog-categories-grid__label">{tile.labelRu}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
