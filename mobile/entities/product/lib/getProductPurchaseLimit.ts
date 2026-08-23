export const getProductPurchaseLimit = (product: unknown): number => {
  if (!product || typeof product !== "object") {
    return 0;
  }

  const source = product as {
    productOutOfStock?: unknown;
    productAvailableQuantity?: unknown;
    productStockQuantity?: unknown;
  };

  if (source.productOutOfStock === true) {
    return 0;
  }

  const raw = source.productAvailableQuantity ?? source.productStockQuantity ?? 0;
  return Math.max(0, Math.floor(Number(raw) || 0));
};
