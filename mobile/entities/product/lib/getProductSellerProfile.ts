import { getProductSellerDisplayName } from "@/entities/product/lib/getProductSellerDisplayName";
import { getProductSellerId } from "@/entities/product/lib/getProductSellerId";

export type ProductSellerProfile = {
  sellerId: string | null;
  displayName: string;
  isPremiumUser: boolean;
  isUserDataConfirmed: boolean;
};

export const getProductSellerProfile = (product: unknown): ProductSellerProfile | null => {
  const displayName = getProductSellerDisplayName(product).trim();
  if (!displayName) {
    return null;
  }

  const sellerId = getProductSellerId(product);
  const seller =
    product != null && typeof product === "object"
      ? (product as { productSeller?: unknown }).productSeller
      : null;

  const isPopulatedSeller = seller != null && typeof seller === "object";
  const isPremiumUser =
    isPopulatedSeller && (seller as { isPremiumUser?: boolean }).isPremiumUser === true;
  const isUserDataConfirmed =
    isPopulatedSeller &&
    (seller as { isUserDataConfirmed?: boolean }).isUserDataConfirmed === true;

  return {
    sellerId,
    displayName,
    isPremiumUser,
    isUserDataConfirmed,
  };
};
