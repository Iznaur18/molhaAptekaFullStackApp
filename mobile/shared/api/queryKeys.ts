export const authMeQueryKeys = {
  all: ["auth", "me"] as const,
};

export const catalogQueryKeys = {
  all: ["catalog"] as const,
  list: (params: Record<string, unknown>) =>
    [...catalogQueryKeys.all, "list", params] as const,
  product: (productId: string) =>
    [...catalogQueryKeys.all, "product", productId] as const,
};

export const cartQueryKeys = {
  all: ["cart", "me"] as const,
};

export const addressQueryKeys = {
  all: ["address"] as const,
  suggestions: (query: string) => [...addressQueryKeys.all, "suggest", query] as const,
};

export const categoryDisplayQueryKeys = {
  all: ["category-displays"] as const,
};

export const orderQueryKeys = {
  all: ["orders"] as const,
  my: () => [...orderQueryKeys.all, "my"] as const,
};

export const categoryTreeQueryKeys = {
  all: ["category-tree"] as const,
  children: (categoryId: string) =>
    [...categoryTreeQueryKeys.all, "children", categoryId] as const,
};

export const productReportQueryKeys = {
  all: ["product-report"] as const,
  myStatus: (productId: string) =>
    [...productReportQueryKeys.all, "me", productId] as const,
};
