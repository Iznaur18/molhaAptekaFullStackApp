export type CatalogFeedTileKind = "sort" | "filter";

export type CatalogFeedTile = {
  key: string;
  kind: CatalogFeedTileKind;
  value: string;
  label: string;
};

export const CATALOG_SORT_NEWEST = "newest";
export const CATALOG_SORT_VIEWS = "views";
export const CATALOG_SORT_PURCHASES = "purchases";
export const CATALOG_SORT_REVIEWS = "reviews";
export const CATALOG_SORT_PREMIUM = "premium";
export const CATALOG_SORT_CONFIRMED = "confirmed";

export const CATALOG_FILTER_NEAR = "__near__";
export const CATALOG_FILTER_FOLLOWING_ONLY = "__following_only__";
export const CATALOG_FILTER_AUCTION_ONLY = "__auction_only__";
export const CATALOG_FILTER_INSTALLMENT_ONLY = "__installment_only__";
export const CATALOG_FILTER_SALE_ONLY = "__sale_only__";
export const CATALOG_FILTER_RENTAL_ONLY = "__rental_only__";
export const CATALOG_FILTER_AFFILIATE_ONLY = "__affiliate_only__";
export const CATALOG_FILTER_WHOLESALE_ONLY = "__wholesale_only__";
export const CATALOG_FILTER_ORIGINAL_ONLY = "__original_only__";

export const CATALOG_FEED_TILES: CatalogFeedTile[] = [
  { key: "sort:newest", kind: "sort", value: CATALOG_SORT_NEWEST, label: "Новинки" },
  { key: "sort:views", kind: "sort", value: CATALOG_SORT_VIEWS, label: "Популярные" },
  { key: "sort:purchases", kind: "sort", value: CATALOG_SORT_PURCHASES, label: "Покупают" },
  { key: "sort:reviews", kind: "sort", value: CATALOG_SORT_REVIEWS, label: "По отзывам" },
  { key: "sort:premium", kind: "sort", value: CATALOG_SORT_PREMIUM, label: "Premium" },
  { key: "sort:confirmed", kind: "sort", value: CATALOG_SORT_CONFIRMED, label: "Проверенные" },
  {
    key: `filter:${CATALOG_FILTER_NEAR}`,
    kind: "filter",
    value: CATALOG_FILTER_NEAR,
    label: "Рядом",
  },
  {
    key: `filter:${CATALOG_FILTER_FOLLOWING_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_FOLLOWING_ONLY,
    label: "Подписки",
  },
  {
    key: `filter:${CATALOG_FILTER_AUCTION_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_AUCTION_ONLY,
    label: "Аукцион",
  },
  {
    key: `filter:${CATALOG_FILTER_INSTALLMENT_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_INSTALLMENT_ONLY,
    label: "Рассрочка",
  },
  {
    key: `filter:${CATALOG_FILTER_SALE_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_SALE_ONLY,
    label: "Скидки",
  },
  {
    key: `filter:${CATALOG_FILTER_RENTAL_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_RENTAL_ONLY,
    label: "Прокат и аренда",
  },
  {
    key: `filter:${CATALOG_FILTER_AFFILIATE_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_AFFILIATE_ONLY,
    label: "Партнерская программа",
  },
  {
    key: `filter:${CATALOG_FILTER_WHOLESALE_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_WHOLESALE_ONLY,
    label: "Оптовая цена",
  },
  {
    key: `filter:${CATALOG_FILTER_ORIGINAL_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_ORIGINAL_ONLY,
    label: "Только оригинал",
  },
];
