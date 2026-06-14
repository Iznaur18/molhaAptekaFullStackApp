import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";
import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_SORT_NEWEST,
  type CatalogFeedTile,
} from "@/entities/product-category-display/lib/catalogFeedTiles";

export const buildQueryForCatalogFeedTile = (
  tile: CatalogFeedTile,
): Pick<
  CatalogListFilters,
  "sort" | "followingOnly" | "auctionOnly" | "installmentOnly" | "saleOnly"
> => {
  if (tile.kind === "sort") {
    return {
      sort: tile.value as CatalogListFilters["sort"],
      followingOnly: false,
      auctionOnly: false,
      installmentOnly: false,
      saleOnly: false,
    };
  }

  const base = {
    sort: CATALOG_SORT_NEWEST as CatalogListFilters["sort"],
    followingOnly: false,
    auctionOnly: false,
    installmentOnly: false,
    saleOnly: false,
  };

  if (tile.value === CATALOG_FILTER_FOLLOWING_ONLY) {
    return { ...base, followingOnly: true };
  }
  if (tile.value === CATALOG_FILTER_AUCTION_ONLY) {
    return { ...base, auctionOnly: true };
  }
  if (tile.value === CATALOG_FILTER_INSTALLMENT_ONLY) {
    return { ...base, installmentOnly: true };
  }
  if (tile.value === CATALOG_FILTER_SALE_ONLY) {
    return { ...base, saleOnly: true };
  }

  return base;
};
