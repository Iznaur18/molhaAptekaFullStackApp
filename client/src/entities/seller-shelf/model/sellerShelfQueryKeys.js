export const sellerShelfQueryKeys = {
  all: ["seller-shelf"],
  mine: () => [...sellerShelfQueryKeys.all, "me"],
  publicBySeller: (sellerId) => [
    ...sellerShelfQueryKeys.all,
    "seller",
    String(sellerId),
  ],
};
