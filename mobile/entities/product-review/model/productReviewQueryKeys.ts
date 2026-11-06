export const productReviewQueryKeys = {
  all: ["product-review"] as const,
  summary: (productId: string) =>
    [...productReviewQueryKeys.all, "summary", productId] as const,
  /** Все страницы отзывов товара — для «Показать ещё». */
  pages: (productId: string) =>
    [...productReviewQueryKeys.all, "pages", productId] as const,
};
