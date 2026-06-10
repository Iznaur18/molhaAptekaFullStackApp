import {
  PRODUCT_CATEGORY_DISPLAY_UI,
  SELLER_PERSONAL_CATEGORY_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { SellerPersonalCategoriesGrid } from "../../seller-personal-category/ui/SellerPersonalCategoriesGrid.jsx";
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
 *   categoryRoots: import('../../product-category-tree/model/types.js').ProductCategoryNode[];
 *   onCategoryClick: (item: import('../model/types.js').ResolvedProductCategoryDisplay) => void;
 *   onEditCategoryClick: (categorySlug: string) => void;
 *   pendingCategoryKey?: string | null;
 *   feedTileDisplays: import('../model/types.js').ProductCatalogFeedTileDisplayFromApi[];
 *   onEditFeedTileClick: (tileKey: string) => void;
 *   personalCategoryTiles: Array<{ _id: string; sellerId: string; labelRu: string; imageUrl?: string | null }>;
 *   onPersonalCategoryClick: (tile: { _id: string; sellerId: string; labelRu: string }) => void;
 * }} props
 */
export function CatalogBrowserLanding({
  displays,
  feedTileDisplays,
  categoryRoots,
  personalCategoryTiles,
  isAdmin,
  isLoading,
  errorMessage,
  onFeedTileClick,
  onCategoryClick,
  onPersonalCategoryClick,
  onEditCategoryClick,
  pendingCategoryKey = null,
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
      {personalCategoryTiles.length > 0 ? (
        <section
          className="catalog-browser-landing__categories"
          aria-label={SELLER_PERSONAL_CATEGORY_PAGE_UI.TILES_SECTION_TITLE}
        >
          <h2 className="catalog-browser-landing__categories-title">
            {SELLER_PERSONAL_CATEGORY_PAGE_UI.TILES_SECTION_TITLE}
          </h2>
          <SellerPersonalCategoriesGrid
            tiles={personalCategoryTiles}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onTileClick={onPersonalCategoryClick}
          />
        </section>
      ) : null}
      <section
        className="catalog-browser-landing__categories"
        aria-label={PRODUCT_CATEGORY_DISPLAY_UI.GRID_ARIA}
      >
        <h2 className="catalog-browser-landing__categories-title">
          {PRODUCT_CATEGORY_DISPLAY_UI.CATEGORIES_SECTION_TITLE}
        </h2>
        <CatalogCategoriesGrid
          displays={displays}
          categoryRoots={categoryRoots}
          isAdmin={isAdmin}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onCategoryClick={onCategoryClick}
          onEditCategoryClick={onEditCategoryClick}
          pendingCategoryKey={pendingCategoryKey}
          showSectionShell={false}
        />
      </section>
    </div>
  );
}
