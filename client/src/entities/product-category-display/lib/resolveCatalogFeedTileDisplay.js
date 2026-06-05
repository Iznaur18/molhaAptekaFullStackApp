import { CATALOG_FEED_TILES } from "./buildCatalogFeedTiles.js";
import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "./resolveProductCategoryDisplay.js";

export { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE as CATALOG_FEED_TILE_PLACEHOLDER_IMAGE };

/**
 * @param {import('./buildCatalogFeedTiles.js').CatalogFeedTile} tile
 */
export function getDefaultCatalogFeedTileLabel(tile) {
  return tile.label;
}

/**
 * @param {string} tileKey
 */
export function findCatalogFeedTileByKey(tileKey) {
  return CATALOG_FEED_TILES.find((tile) => tile.key === tileKey) ?? null;
}

/**
 * @param {import('./buildCatalogFeedTiles.js').CatalogFeedTile} tile
 * @param {Map<string, import('../model/types.js').ProductCatalogFeedTileDisplayFromApi>} [overridesByKey]
 * @returns {import('../model/types.js').ResolvedCatalogFeedTileDisplay}
 */
export function resolveCatalogFeedTileDisplay(tile, overridesByKey) {
  const override = overridesByKey?.get(tile.key);
  const customLabel =
    typeof override?.customLabel === "string" && override.customLabel.trim()
      ? override.customLabel.trim()
      : null;
  const customImage =
    typeof override?.imageUrl === "string" && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : null;

  return {
    tileKey: tile.key,
    label: customLabel ?? tile.label,
    imageUrl: customImage,
    isCustomLabel: customLabel != null,
    isCustomImage: customImage != null,
  };
}

/**
 * @param {import('../model/types.js').ProductCatalogFeedTileDisplayFromApi[]} displays
 * @returns {import('../model/types.js').ResolvedCatalogFeedTileDisplay[]}
 */
export function buildResolvedCatalogFeedTileDisplays(displays) {
  const overridesByKey = new Map(displays.map((row) => [row.tileKey, row]));
  return CATALOG_FEED_TILES.map((tile) =>
    resolveCatalogFeedTileDisplay(tile, overridesByKey),
  );
}
