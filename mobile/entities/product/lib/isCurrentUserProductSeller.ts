export const isCurrentUserProductSeller = (
  product: unknown,
  currentUserId?: string | null,
): boolean => {
  if (!currentUserId || !product || typeof product !== "object") {
    return false;
  }

  const seller = (product as { productSeller?: unknown }).productSeller;
  if (seller == null) {
    return false;
  }
  if (typeof seller === "object" && seller !== null && "_id" in seller) {
    return String((seller as { _id: unknown })._id) === String(currentUserId);
  }
  return String(seller) === String(currentUserId);
};
