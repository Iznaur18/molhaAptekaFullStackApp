export const productPromoCodeQueryKeys = {
  all: ["product-promo-code"],
  list: (productId) => [...productPromoCodeQueryKeys.all, "list", productId],
  appliedMine: () => [...productPromoCodeQueryKeys.all, "applied-mine"],
};
