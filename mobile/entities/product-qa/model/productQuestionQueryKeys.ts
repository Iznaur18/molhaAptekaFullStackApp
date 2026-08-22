export const productQuestionQueryKeys = {
  all: ["product-qa"] as const,
  summary: (productId: string) =>
    [...productQuestionQueryKeys.all, "summary", productId] as const,
  list: (productId: string) =>
    [...productQuestionQueryKeys.all, "list", productId] as const,
};
