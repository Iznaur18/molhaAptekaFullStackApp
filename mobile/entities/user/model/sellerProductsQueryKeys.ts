export const sellerProductsQueryKeys = {
  all: ["user", "seller-products"] as const,
  list: (sellerId: string, shelfId: string | null = null) =>
    [...sellerProductsQueryKeys.all, sellerId, shelfId ? String(shelfId) : "all"] as const,
};
