import {
  isSellerProductsLimitUnlimited,
  resolveSellerProductsLimit,
  SELLER_PRODUCTS_LIMIT_UNLIMITED,
} from "@molha/api-contract";

import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";

type SellerProductsLimitUser = {
  isPremiumUser?: boolean;
  premiumExpiresAt?: string | Date | null;
  sellerProductsLimitOverride?: number | null;
};

export const getSellerProductsLimit = (
  user: SellerProductsLimitUser | null | undefined,
): number => resolveSellerProductsLimit(user, isPremiumActive(user));

export const formatSellerProductsQuota = (
  used: number | null | undefined,
  limit: number,
): string => {
  const usedLabel = used == null ? "—" : String(used);
  if (isSellerProductsLimitUnlimited(limit)) {
    return `${usedLabel} / ∞`;
  }
  return `${usedLabel} / ${limit}`;
};

export const isSellerProductsLimitReached = (
  limit: number | null | undefined,
  used: number | null | undefined,
): boolean => {
  if (limit == null || used == null) {
    return false;
  }
  if (isSellerProductsLimitUnlimited(limit)) {
    return false;
  }
  return used >= limit;
};

export { SELLER_PRODUCTS_LIMIT_UNLIMITED, isSellerProductsLimitUnlimited };
