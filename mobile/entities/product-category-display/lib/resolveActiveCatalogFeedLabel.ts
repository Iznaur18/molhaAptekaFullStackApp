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
} from "@/entities/product-category-display/lib/catalogFeedTiles";

/** Паритет с `client/.../productConstants.js` → `CATALOG_SORT_LABEL_RU`. */
const CATALOG_SORT_LABEL_RU: Record<string, string> = {
  [CATALOG_SORT_NEWEST]: "Новинки",
  views: "По просмотрам",
  purchases: "Больше всего купили",
  premium: "Только премиум",
  confirmed: "Подтверждённые продавцы",
  reviews: "По отзывам",
  [CATALOG_FILTER_NEAR]: "Рядом",
  [CATALOG_FILTER_FLASH_SALE_ONLY]: "Горящие скидки",
  [CATALOG_FILTER_FOLLOWING_ONLY]: "Только от подписок",
  [CATALOG_FILTER_AUCTION_ONLY]: "Только с аукционом",
  [CATALOG_FILTER_INSTALLMENT_ONLY]: "Только в рассрочку",
  [CATALOG_FILTER_SALE_ONLY]: "Распродажа",
  [CATALOG_FILTER_RENTAL_ONLY]: "Прокат и аренда",
  [CATALOG_FILTER_AFFILIATE_ONLY]: "Партнерская программа",
  [CATALOG_FILTER_WHOLESALE_ONLY]: "Оптовая цена",
  [CATALOG_FILTER_BUY_N_FREE_ONLY]: "Бесплатно от",
  [CATALOG_FILTER_ORIGINAL_ONLY]: "Только оригинал",
};

type CatalogFeedQuery = {
  sort?: string;
  followingOnly?: boolean;
  auctionOnly?: boolean;
  installmentOnly?: boolean;
  saleOnly?: boolean;
  rentalOnly?: boolean;
  affiliateOnly?: boolean;
  wholesaleOnly?: boolean;
  buyNFreeOnly?: boolean;
  originalOnly?: boolean;
  flashSaleOnly?: boolean;
  near?: boolean;
};

export const resolveActiveCatalogFeedLabel = (query: CatalogFeedQuery): string | null => {
  if (query.near) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_NEAR];
  }
  if (query.flashSaleOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_FLASH_SALE_ONLY];
  }
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
  if (query.rentalOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_RENTAL_ONLY];
  }
  if (query.affiliateOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_AFFILIATE_ONLY];
  }
  if (query.wholesaleOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_WHOLESALE_ONLY];
  }
  if (query.buyNFreeOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_BUY_N_FREE_ONLY];
  }
  if (query.originalOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_ORIGINAL_ONLY];
  }
  if (query.sort === CATALOG_SORT_NEWEST) {
    return CATALOG_SORT_LABEL_RU[CATALOG_SORT_NEWEST];
  }
  if (query.sort) {
    return CATALOG_SORT_LABEL_RU[query.sort] ?? null;
  }
  return null;
};
