export const productPromotionQueryKeys = {
  all: ["product", "promotion"] as const,
  tariffs: () => [...productPromotionQueryKeys.all, "tariffs"] as const,
  boostProducts: (regionCode = "") =>
    [...productPromotionQueryKeys.all, "boost-products", { regionCode }] as const,
};
