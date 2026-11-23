export const sellerShelfQueryKeys = {
  all: ["seller-shelf"] as const,
  mine: () => [...sellerShelfQueryKeys.all, "me"] as const,
  publicOneCBySeller: (sellerId: string) =>
    [
      ...sellerShelfQueryKeys.all,
      "seller",
      String(sellerId),
      "onec",
    ] as const,
  publicBySeller: (sellerId: string) =>
    [...sellerShelfQueryKeys.all, "seller", String(sellerId)] as const,
};
