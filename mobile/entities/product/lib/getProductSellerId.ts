export const getProductSellerId = (product: unknown): string | null => {
  if (!product || typeof product !== "object") {
    return null;
  }
  const seller = (product as { productSeller?: unknown }).productSeller;
  if (seller == null) {
    return null;
  }
  if (typeof seller === "object" && seller !== null && "_id" in seller) {
    return String((seller as { _id: unknown })._id);
  }
  return String(seller);
};
