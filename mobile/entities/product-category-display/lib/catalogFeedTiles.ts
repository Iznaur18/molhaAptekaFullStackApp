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
export const CATALOG_SORT_CITY = "city";
export const CATALOG_SORT_REVIEWS = "reviews";
export const CATALOG_SORT_PREMIUM = "premium";
export const CATALOG_SORT_CONFIRMED = "confirmed";

export const CATALOG_FILTER_FOLLOWING_ONLY = "__following_only__";
export const CATALOG_FILTER_AUCTION_ONLY = "__auction_only__";
export const CATALOG_FILTER_INSTALLMENT_ONLY = "__installment_only__";
export const CATALOG_FILTER_SALE_ONLY = "__sale_only__";

export const CATALOG_FEED_TILES: CatalogFeedTile[] = [
  { key: "sort:newest", kind: "sort", value: CATALOG_SORT_NEWEST, label: "Новинки" },
  { key: "sort:views", kind: "sort", value: CATALOG_SORT_VIEWS, label: "Популярные" },
  { key: "sort:purchases", kind: "sort", value: CATALOG_SORT_PURCHASES, label: "Покупают" },
  { key: "sort:city", kind: "sort", value: CATALOG_SORT_CITY, label: "По городу" },
  { key: "sort:reviews", kind: "sort", value: CATALOG_SORT_REVIEWS, label: "По отзывам" },
  { key: "sort:premium", kind: "sort", value: CATALOG_SORT_PREMIUM, label: "Premium" },
  { key: "sort:confirmed", kind: "sort", value: CATALOG_SORT_CONFIRMED, label: "Проверенные" },
  {
    key: "filter:following",
    kind: "filter",
    value: CATALOG_FILTER_FOLLOWING_ONLY,
    label: "Подписки",
  },
  {
    key: "filter:auction",
    kind: "filter",
    value: CATALOG_FILTER_AUCTION_ONLY,
    label: "Аукцион",
  },
  {
    key: "filter:installment",
    kind: "filter",
    value: CATALOG_FILTER_INSTALLMENT_ONLY,
    label: "Рассрочка",
  },
  { key: "filter:sale", kind: "filter", value: CATALOG_FILTER_SALE_ONLY, label: "Скидки" },
];
