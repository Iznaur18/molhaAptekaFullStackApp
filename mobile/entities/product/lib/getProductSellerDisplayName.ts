export const getProductSellerDisplayName = (product: unknown): string => {
  if (!product || typeof product !== "object") {
    return "";
  }

  const seller = (product as { productSeller?: unknown }).productSeller;
  if (seller == null) {
    return "";
  }
  if (typeof seller === "object" && seller !== null) {
    const name = (seller as { userName?: string }).userName?.trim();
    if (name) {
      return name;
    }
    if ("_id" in seller) {
      return String((seller as { _id: unknown })._id);
    }
  }
  return String(seller);
};
