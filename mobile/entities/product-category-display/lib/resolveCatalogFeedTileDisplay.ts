import {
  CATALOG_FEED_TILES,
  type CatalogFeedTile,
} from "./catalogFeedTiles";

export type ProductCatalogFeedTileDisplayFromApi = {
  tileKey: string;
  customLabel?: string | null;
  imageUrl?: string | null;
};

export type ResolvedCatalogFeedTileDisplay = {
  tileKey: string;
  tile: CatalogFeedTile;
  label: string;
  imageUrl: string | null;
  isCustomLabel: boolean;
  isCustomImage: boolean;
};

export const findCatalogFeedTileByKey = (tileKey: string): CatalogFeedTile | null =>
  CATALOG_FEED_TILES.find((tile) => tile.key === tileKey) ?? null;

export const resolveCatalogFeedTileDisplay = (
  tile: CatalogFeedTile,
  overridesByKey: Map<string, ProductCatalogFeedTileDisplayFromApi>,
): ResolvedCatalogFeedTileDisplay => {
  const override = overridesByKey.get(tile.key);
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
    tile,
    label: customLabel ?? tile.label,
    imageUrl: customImage,
    isCustomLabel: customLabel != null,
    isCustomImage: customImage != null,
  };
};

export const buildResolvedCatalogFeedTileDisplays = (
  displays: ProductCatalogFeedTileDisplayFromApi[],
): ResolvedCatalogFeedTileDisplay[] => {
  const overridesByKey = new Map(displays.map((row) => [row.tileKey, row]));
  return CATALOG_FEED_TILES.map((tile) => resolveCatalogFeedTileDisplay(tile, overridesByKey));
};
