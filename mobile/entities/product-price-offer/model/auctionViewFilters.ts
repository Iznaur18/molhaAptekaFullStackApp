export const AUCTION_VIEW_FILTER_OPTIONS = [
  { value: "", labelKey: "VIEW_FILTER_ALL" as const },
  { value: "buyer", labelKey: "VIEW_FILTER_BUYER" as const },
  { value: "seller", labelKey: "VIEW_FILTER_SELLER" as const },
] as const;

export const AUCTION_VIEW_FILTER_BUYER = "buyer";
export const AUCTION_VIEW_FILTER_SELLER = "seller";
