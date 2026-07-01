import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";
import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
} from "@/entities/product/model/productConstants";

type SellerProductsLimitUser = {
  isPremiumUser?: boolean;
  premiumExpiresAt?: string | Date | null;
};

export const getSellerProductsLimit = (user: SellerProductsLimitUser | null | undefined): number =>
  isPremiumActive(user) ? SELLER_PRODUCTS_LIMIT_PREMIUM : SELLER_PRODUCTS_LIMIT_REGULAR;

export const formatSellerProductsQuota = (
  used: number | null | undefined,
  limit: number,
): string => {
  const usedLabel = used == null ? "—" : String(used);
  return `${usedLabel} / ${limit}`;
};
