import { useCallback } from "react";

import { CART_STORAGE_KEY } from "../../../entities/order/model/constants.js";
import { useLogoutMutation } from "../../../entities/user/model/useLogoutMutation.js";
import { EMPTY_MY_PROFILE_PAGE } from "../lib/catalogShellConstants.js";

/**
 * @param {object} params
 */
export const useHomeLogout = ({
  flushRemoteCart,
  navigate,
  clearAuthSession,
  setMyProfilePage,
  setIsEditProfileOpen,
  clearInAppNotifications,
}) => {
  const logoutMutation = useLogoutMutation();

  return useCallback(async () => {
    await flushRemoteCart();
    await logoutMutation.mutateAsync();
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // storage недоступен
    }
    clearAuthSession();
    setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
    setIsEditProfileOpen(false);
    clearInAppNotifications();
    navigate("/", { replace: true });
  }, [
    clearAuthSession,
    clearInAppNotifications,
    flushRemoteCart,
    logoutMutation,
    navigate,
    setIsEditProfileOpen,
    setMyProfilePage,
  ]);
};
