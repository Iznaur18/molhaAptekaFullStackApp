export const productReviewQueryKeys = {
  all: ["product-review"] as const,
  summary: (productId: string) => [...productReviewQueryKeys.all, "summary", productId] as const,
  list: (productId: string, page: number) =>
    [...productReviewQueryKeys.all, "list", productId, page] as const,
};
