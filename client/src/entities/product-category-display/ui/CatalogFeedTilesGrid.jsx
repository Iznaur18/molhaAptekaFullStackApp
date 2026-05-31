import { CATALOG_FEED_TILES } from "../lib/buildCatalogFeedTiles.js";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";

import "./CatalogFeedTilesGrid.css";

/**
 * @param {{
 *   onFeedTileClick: (tile: import('../lib/buildCatalogFeedTiles.js').CatalogFeedTile) => void;
 * }} props
 */
export function CatalogFeedTilesGrid({ onFeedTileClick }) {
  return (
    <section
      className="catalog-feed-tiles"
      aria-label={PRODUCT_CATEGORY_DISPLAY_UI.FEED_GRID_ARIA}
    >
      <h2 className="catalog-feed-tiles__title">
        {PRODUCT_CATEGORY_DISPLAY_UI.FEED_SECTION_TITLE}
      </h2>
      <ul className="catalog-categories-grid__list">
        {CATALOG_FEED_TILES.map((tile) => (
          <li key={tile.key} className="catalog-categories-grid__item">
            <button
              type="button"
              className="catalog-categories-grid__card catalog-feed-tiles__card"
              onClick={() => onFeedTileClick(tile)}
            >
              <span
                className={[
                  "catalog-categories-grid__image-wrap",
                  "catalog-feed-tiles__icon-wrap",
                  `catalog-feed-tiles__icon-wrap_${tile.kind}`,
                ].join(" ")}
                aria-hidden="true"
              >
                <span className="catalog-feed-tiles__icon-text">
                  {tile.label.charAt(0)}
                </span>
              </span>
              <span className="catalog-categories-grid__label">{tile.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
