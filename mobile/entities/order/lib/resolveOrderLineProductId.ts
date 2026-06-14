export const resolveOrderLineProductId = (item: unknown): string | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const productId = (item as { productId?: { _id?: string } | string }).productId;
  if (productId == null) {
    return null;
  }

  if (typeof productId === "object" && productId._id != null) {
    return String(productId._id);
  }

  if (typeof productId === "string" && productId.trim()) {
    return productId.trim();
  }

  return null;
};
