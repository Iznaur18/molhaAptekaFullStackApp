export const productPromotionQueryKeys = {
  all: ["product-promotions"],
  staffPending: () => [...productPromotionQueryKeys.all, "staff", "pending"],
  staffPendingCount: () => [...productPromotionQueryKeys.all, "staff", "pending", "count"],
};
