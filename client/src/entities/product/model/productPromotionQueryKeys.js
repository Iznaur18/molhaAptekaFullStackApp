export const productPromotionQueryKeys = {
  all: ["product", "promotion"],
  tariffs: () => [...productPromotionQueryKeys.all, "tariffs"],
};
