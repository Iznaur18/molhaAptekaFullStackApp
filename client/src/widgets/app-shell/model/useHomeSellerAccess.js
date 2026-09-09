import { useMemo } from "react";
import { normalizeSellerProductsLimitOverride } from "@molha/api-contract";

import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
} from "../../../entities/user/model/userConstants.js";
import {
  getSellerProductsLimit,
  isSellerProductsLimitReached,
} from "../../../entities/product/lib/sellerProductsLimit.js";

/**
 * @param {{
 *   currentUserRole: string | null | undefined;
 *   authUser: {
 *     isPremiumUser?: boolean;
 *     premiumExpiresAt?: string | Date | null;
 *     sellerProductsLimitOverride?: number | null;
 *   } | null | undefined;
 *   myProductsTotal: number | null | undefined;
 * }} params
 */
export const useHomeSellerAccess = ({
  currentUserRole,
  authUser,
  myProductsTotal,
}) => {
  const isAdmin = currentUserRole === USER_ROLE_ADMIN;
  const canModerateProducts =
    currentUserRole === USER_ROLE_ADMIN || currentUserRole === USER_ROLE_MODERATOR;

  const sellerProductsLimit = useMemo(() => {
    if (isAdmin) {
      return null;
    }
    return getSellerProductsLimit(authUser);
  }, [authUser, isAdmin]);

  const hasPersonalSellerProductsLimit =
    !isAdmin &&
    normalizeSellerProductsLimitOverride(authUser?.sellerProductsLimitOverride) !==
      null;

  const isAtSellerProductsLimit = isSellerProductsLimitReached(
    sellerProductsLimit,
    myProductsTotal,
  );

  return {
    isAdmin,
    canModerateProducts,
    sellerProductsLimit,
    hasPersonalSellerProductsLimit,
    isAtSellerProductsLimit,
  };
};
