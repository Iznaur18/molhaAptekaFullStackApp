export const isOrderLineItemProductClickable = (item: unknown): boolean => {
  if (!item || typeof item !== "object") {
    return false;
  }

  const productId = (item as { productId?: unknown }).productId;
  return productId != null && typeof productId === "object";
};
