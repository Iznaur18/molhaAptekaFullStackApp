import { useMemo } from "react";

import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
} from "../../../entities/user/model/userConstants.js";
import { getSellerProductsLimit } from "../../../entities/product/lib/sellerProductsLimit.js";

/**
 * @param {object} params
 */
export const useHomeSellerAccess = ({
  currentUserRole,
  isPremiumUser,
  myProductsTotal,
}) => {
  const isAdmin = currentUserRole === USER_ROLE_ADMIN;
  const canModerateProducts =
    currentUserRole === USER_ROLE_ADMIN || currentUserRole === USER_ROLE_MODERATOR;

  const sellerProductsLimit = useMemo(() => {
    if (isAdmin) {
      return null;
    }
    return getSellerProductsLimit({ isPremiumUser });
  }, [isAdmin, isPremiumUser]);

  const isAtSellerProductsLimit =
    sellerProductsLimit != null &&
    myProductsTotal != null &&
    myProductsTotal >= sellerProductsLimit;

  return {
    isAdmin,
    canModerateProducts,
    sellerProductsLimit,
    isAtSellerProductsLimit,
  };
};
