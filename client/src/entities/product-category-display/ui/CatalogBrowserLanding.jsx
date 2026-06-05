import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";
import { CatalogCategoriesGrid } from "./CatalogCategoriesGrid.jsx";
import { CatalogFeedTilesGrid } from "./CatalogFeedTilesGrid.jsx";

import "./CatalogFeedTilesGrid.css";

/**
 * @param {{
 *   displays: import('../model/types.js').ProductCategoryDisplayFromApi[];
 *   isAdmin: boolean;
 *   isLoading: boolean;
 *   errorMessage: string | null;
 *   onFeedTileClick: (tile: import('../lib/buildCatalogFeedTiles.js').CatalogFeedTile) => void;
 *   onCategoryClick: (categorySlug: import('../../product/model/types.js').ProductCategory) => void;
 *   onEditCategoryClick: (categorySlug: import('../../product/model/types.js').ProductCategory) => void;
 *   feedTileDisplays: import('../model/types.js').ProductCatalogFeedTileDisplayFromApi[];
 *   onEditFeedTileClick: (tileKey: string) => void;
 * }} props
 */
export function CatalogBrowserLanding({
  displays,
  feedTileDisplays,
  isAdmin,
  isLoading,
  errorMessage,
  onFeedTileClick,
  onCategoryClick,
  onEditCategoryClick,
  onEditFeedTileClick,
}) {
  return (
    <div className="catalog-browser-landing">
      <CatalogFeedTilesGrid
        feedTileDisplays={feedTileDisplays}
        isAdmin={isAdmin}
        onFeedTileClick={onFeedTileClick}
        onEditFeedTileClick={onEditFeedTileClick}
      />
      <section
        className="catalog-browser-landing__categories"
        aria-label={PRODUCT_CATEGORY_DISPLAY_UI.GRID_ARIA}
      >
        <h2 className="catalog-browser-landing__categories-title">
          {PRODUCT_CATEGORY_DISPLAY_UI.CATEGORIES_SECTION_TITLE}
        </h2>
        <CatalogCategoriesGrid
          displays={displays}
          isAdmin={isAdmin}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onCategoryClick={onCategoryClick}
          onEditCategoryClick={onEditCategoryClick}
          showSectionShell={false}
        />
      </section>
    </div>
  );
}
