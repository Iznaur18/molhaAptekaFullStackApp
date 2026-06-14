export const sellerProductsQueryKeys = {
  all: ["user", "seller-products"] as const,
  list: (sellerId: string) => [...sellerProductsQueryKeys.all, sellerId] as const,
};
