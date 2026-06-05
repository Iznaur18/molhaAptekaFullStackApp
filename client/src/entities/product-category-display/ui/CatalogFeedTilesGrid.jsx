import { useMemo } from "react";

import { CATALOG_FEED_TILES } from "../lib/buildCatalogFeedTiles.js";
import {
  CATALOG_FEED_TILE_PLACEHOLDER_IMAGE,
  buildResolvedCatalogFeedTileDisplays,
} from "../lib/resolveCatalogFeedTileDisplay.js";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { Pencil } from "../../../shared/ui/icon/index.js";

import "./CatalogCategoriesGrid.css";
import "./CatalogFeedTilesGrid.css";

/**
 * @param {{
 *   feedTileDisplays: import('../model/types.js').ProductCatalogFeedTileDisplayFromApi[];
 *   isAdmin: boolean;
 *   onFeedTileClick: (tile: import('../lib/buildCatalogFeedTiles.js').CatalogFeedTile) => void;
 *   onEditFeedTileClick: (tileKey: string) => void;
 * }} props
 */
export function CatalogFeedTilesGrid({
  feedTileDisplays,
  isAdmin,
  onFeedTileClick,
  onEditFeedTileClick,
}) {
  const items = useMemo(
    () => buildResolvedCatalogFeedTileDisplays(feedTileDisplays),
    [feedTileDisplays],
  );

  const tileByKey = useMemo(
    () => new Map(CATALOG_FEED_TILES.map((tile) => [tile.key, tile])),
    [],
  );

  return (
    <section
      className="catalog-feed-tiles"
      aria-label={PRODUCT_CATEGORY_DISPLAY_UI.FEED_GRID_ARIA}
    >
      <h2 className="catalog-feed-tiles__title">
        {PRODUCT_CATEGORY_DISPLAY_UI.FEED_SECTION_TITLE}
      </h2>
      <ul className="catalog-categories-grid__list">
        {items.map((item) => {
          const tile = tileByKey.get(item.tileKey);
          if (!tile) {
            return null;
          }

          const imageSrc = item.imageUrl
            ? resolveUploadedImageUrl(item.imageUrl)
            : CATALOG_FEED_TILE_PLACEHOLDER_IMAGE;

          return (
            <li key={item.tileKey} className="catalog-categories-grid__item">
              <div className="catalog-categories-grid__card-wrap">
                <button
                  type="button"
                  className="catalog-categories-grid__card catalog-feed-tiles__card"
                  onClick={() => onFeedTileClick(tile)}
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
                    aria-label={PRODUCT_CATEGORY_DISPLAY_UI.FEED_EDIT_ARIA(item.label)}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditFeedTileClick(item.tileKey);
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
    </section>
  );
}
