import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_SORT_NEWEST,
} from "@/entities/product-category-display/lib/catalogFeedTiles";

/** Паритет с `client/.../productConstants.js` → `CATALOG_SORT_LABEL_RU`. */
const CATALOG_SORT_LABEL_RU: Record<string, string> = {
  [CATALOG_SORT_NEWEST]: "Новинки",
  views: "По просмотрам",
  purchases: "Больше всего купили",
  city: "По городу",
  premium: "Только премиум",
  confirmed: "Подтверждённые продавцы",
  reviews: "По отзывам",
  [CATALOG_FILTER_FOLLOWING_ONLY]: "Только от подписок",
  [CATALOG_FILTER_AUCTION_ONLY]: "Только с аукционом",
  [CATALOG_FILTER_INSTALLMENT_ONLY]: "Только в рассрочку",
  [CATALOG_FILTER_SALE_ONLY]: "Распродажа",
};

type CatalogFeedQuery = {
  sort?: string;
  followingOnly?: boolean;
  auctionOnly?: boolean;
  installmentOnly?: boolean;
  saleOnly?: boolean;
};

export const resolveActiveCatalogFeedLabel = (query: CatalogFeedQuery): string | null => {
  if (query.followingOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_FOLLOWING_ONLY];
  }
  if (query.auctionOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_AUCTION_ONLY];
  }
  if (query.installmentOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_INSTALLMENT_ONLY];
  }
  if (query.saleOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_SALE_ONLY];
  }
  if (query.sort === CATALOG_SORT_NEWEST) {
    return CATALOG_SORT_LABEL_RU[CATALOG_SORT_NEWEST];
  }
  if (query.sort) {
    return CATALOG_SORT_LABEL_RU[query.sort] ?? null;
  }
  return null;
};
