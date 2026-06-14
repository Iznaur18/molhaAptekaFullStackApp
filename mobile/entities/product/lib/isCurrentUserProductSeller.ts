type ProductSellerRef = string | { _id?: string } | null | undefined;

export const isCurrentUserProductSeller = (
  product: unknown,
  currentUserId: string | null | undefined,
): boolean => {
  if (!product || typeof product !== "object" || !currentUserId) {
    return false;
  }

  const seller = (product as { productSeller?: ProductSellerRef }).productSeller;
  if (seller == null) {
    return false;
  }

  if (typeof seller === "object" && seller._id != null) {
    return String(seller._id) === String(currentUserId);
  }

  return String(seller) === String(currentUserId);
};
