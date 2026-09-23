export const sellerShelfQueryKeys = {
  all: ["seller-shelf"],
  mine: () => [...sellerShelfQueryKeys.all, "me"],
  publicOneCBySeller: (sellerId) => [
    ...sellerShelfQueryKeys.all,
    "seller",
    String(sellerId),
    "onec",
  ],
  publicBySeller: (sellerId) => [
    ...sellerShelfQueryKeys.all,
    "seller",
    String(sellerId),
  ],
};
