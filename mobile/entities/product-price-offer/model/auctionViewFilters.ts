export const AUCTION_VIEW_FILTER_BUYER = "buyer";
export const AUCTION_VIEW_FILTER_SELLER = "seller";

export const AUCTION_VIEW_FILTER_OPTIONS = [
  { value: AUCTION_VIEW_FILTER_BUYER, labelKey: "VIEW_FILTER_BUYER" as const },
  { value: AUCTION_VIEW_FILTER_SELLER, labelKey: "VIEW_FILTER_SELLER" as const },
] as const;
