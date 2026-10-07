export const productPromotionQueryKeys = {
  all: ["product", "promotion"],
  tariffs: () => [...productPromotionQueryKeys.all, "tariffs"],
  boostProducts: (regionCode = "") => [
    ...productPromotionQueryKeys.all,
    "boost-products",
    { regionCode },
  ],
};
