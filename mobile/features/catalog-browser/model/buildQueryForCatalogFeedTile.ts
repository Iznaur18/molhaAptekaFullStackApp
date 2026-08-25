import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";
import {
  CATALOG_FILTER_AFFILIATE_ONLY,
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_BUY_N_FREE_ONLY,
  CATALOG_FILTER_FLASH_SALE_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_NEAR,
  CATALOG_FILTER_ORIGINAL_ONLY,
  CATALOG_FILTER_RENTAL_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_FILTER_WHOLESALE_ONLY,
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_PURCHASES,
  type CatalogFeedTile,
} from "@/entities/product-category-display/lib/catalogFeedTiles";

export const buildQueryForCatalogFeedTile = (
  tile: CatalogFeedTile,
): Pick<
  CatalogListFilters,
  | "sort"
  | "followingOnly"
  | "auctionOnly"
  | "installmentOnly"
  | "saleOnly"
  | "rentalOnly"
  | "affiliateOnly"
  | "wholesaleOnly"
  | "buyNFreeOnly"
  | "originalOnly"
  | "flashSaleOnly"
  | "near"
> => {
  if (tile.kind === "sort") {
    return {
      sort: tile.value as CatalogListFilters["sort"],
      followingOnly: false,
      auctionOnly: false,
      installmentOnly: false,
      saleOnly: false,
      rentalOnly: false,
      affiliateOnly: false,
      wholesaleOnly: false,
      buyNFreeOnly: false,
      originalOnly: false,
      flashSaleOnly: false,
      near: false,
    };
  }

  const base = {
    sort: CATALOG_SORT_NEWEST as CatalogListFilters["sort"],
    followingOnly: false,
    auctionOnly: false,
    installmentOnly: false,
    saleOnly: false,
    rentalOnly: false,
    affiliateOnly: false,
    wholesaleOnly: false,
    buyNFreeOnly: false,
    originalOnly: false,
    flashSaleOnly: false,
    near: false,
  };

  if (tile.value === CATALOG_FILTER_NEAR) {
    return { ...base, near: true };
  }
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
  if (tile.value === CATALOG_FILTER_RENTAL_ONLY) {
    return { ...base, rentalOnly: true };
  }
  if (tile.value === CATALOG_FILTER_AFFILIATE_ONLY) {
    return { ...base, affiliateOnly: true };
  }
  if (tile.value === CATALOG_FILTER_WHOLESALE_ONLY) {
    return { ...base, wholesaleOnly: true };
  }
  if (tile.value === CATALOG_FILTER_BUY_N_FREE_ONLY) {
    return {
      ...base,
      buyNFreeOnly: true,
      sort: CATALOG_SORT_PURCHASES as CatalogListFilters["sort"],
    };
  }
  if (tile.value === CATALOG_FILTER_FLASH_SALE_ONLY) {
    return { ...base, flashSaleOnly: true };
  }
  if (tile.value === CATALOG_FILTER_ORIGINAL_ONLY) {
    return { ...base, originalOnly: true };
  }

  return base;
};
