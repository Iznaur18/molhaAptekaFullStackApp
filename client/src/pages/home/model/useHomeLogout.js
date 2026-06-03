import { useCallback } from "react";

import { CART_STORAGE_KEY } from "../../../entities/order/model/constants.js";
import { logoutUser } from "../../../entities/user/api/logoutUser.js";
import { EMPTY_MY_PROFILE_PAGE } from "../lib/homePageConstants.js";

/**
 * @param {object} params
 */
export const useHomeLogout = ({
  flushRemoteCart,
  navigate,
  setCurrentUserId,
  setIsAuthorized,
  setMyProfilePage,
  setIsEditProfileOpen,
  clearInAppNotifications,
}) => {
  return useCallback(async () => {
    await flushRemoteCart();
    await logoutUser();
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // storage недоступен
    }
    setCurrentUserId(null);
    setIsAuthorized(false);
    setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
    setIsEditProfileOpen(false);
    clearInAppNotifications();
    navigate("/", { replace: true });
  }, [
    clearInAppNotifications,
    flushRemoteCart,
    navigate,
    setCurrentUserId,
    setIsAuthorized,
    setIsEditProfileOpen,
    setMyProfilePage,
  ]);
};
