/** Порт `client/src/entities/product-promo-code/model/productPromoCodeQueryKeys.js`. */
export const productPromoCodeQueryKeys = {
  all: ["product-promo-code"] as const,
  list: (productId: string) =>
    [...productPromoCodeQueryKeys.all, "list", productId] as const,
  appliedMine: () => [...productPromoCodeQueryKeys.all, "applied-mine"] as const,
};
