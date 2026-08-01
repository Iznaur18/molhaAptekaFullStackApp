export const productBadgeExplainQueryKeys = {
  all: ["product-badge-explains"] as const,
  list: () => [...productBadgeExplainQueryKeys.all, "list"] as const,
};
