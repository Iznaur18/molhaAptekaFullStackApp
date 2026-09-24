import { useCallback } from "react";

import { CART_STORAGE_KEY } from "../../../entities/order/model/constants.js";
import { clearAllDataConfirmationFormDrafts } from "../../../entities/user-data-confirmation/lib/dataConfirmationFormDraftStorage.js";
import { fetchLinkedAccounts } from "../../../entities/user/api/linkedAccountsApi.js";
import { useLogoutMutation } from "../../../entities/user/model/useLogoutMutation.js";
import { switchAccountAndReload } from "../../../features/account-switcher/lib/accountTransition.js";
import { EMPTY_MY_PROFILE_PAGE } from "../lib/catalogShellConstants.js";

/**
 * Перед уходом из аккаунта (выход, переключение, добавление второго):
 * корзину и избранное — на сервер, локальные следы аккаунта — прочь.
 *
 * @param {{ flushRemoteCart: () => Promise<void>; flushRemoteWishlist: () => Promise<void> }} params
 */
export const usePrepareAccountChange = ({ flushRemoteCart, flushRemoteWishlist }) =>
  useCallback(async () => {
    await flushRemoteCart();
    await flushRemoteWishlist();
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // storage недоступен
    }
    clearAllDataConfirmationFormDrafts();
  }, [flushRemoteCart, flushRemoteWishlist]);

/**
 * Следующий аккаунт этого браузера, в который можно войти без пароля.
 *
 * @returns {Promise<string | null>}
 */
async function findResumableLinkedAccount() {
  try {
    const { accounts } = await fetchLinkedAccounts();
    return (
      accounts.find((account) => !account.isActive && !account.requiresLogin)?.userId ??
      null
    );
  } catch (error) {
    console.warn("[logout] linked accounts lookup failed", error);
    return null;
  }
}

/**
 * @param {object} params
 */
export const useHomeLogout = ({
  flushRemoteCart,
  flushRemoteWishlist,
  navigate,
  clearAuthSession,
  setMyProfilePage,
  clearInAppNotifications,
}) => {
  const logoutMutation = useLogoutMutation();
  const prepareAccountChange = usePrepareAccountChange({
    flushRemoteCart,
    flushRemoteWishlist,
  });

  return useCallback(async () => {
    await prepareAccountChange();
    await logoutMutation.mutateAsync();

    // «Выйти» — только из текущего: если на устройстве есть ещё аккаунт,
    // переходим в него, а не в гостя.
    const nextUserId = await findResumableLinkedAccount();
    if (nextUserId) {
      try {
        await switchAccountAndReload({
          userId: nextUserId,
          prepare: async () => {},
          targetPath: "/",
        });
        return;
      } catch (error) {
        console.warn("[logout] switch to next account failed", error);
      }
    }

    clearAuthSession();
    setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
    clearInAppNotifications();
    navigate("/", { replace: true });
  }, [
    clearAuthSession,
    clearInAppNotifications,
    logoutMutation,
    navigate,
    prepareAccountChange,
    setMyProfilePage,
  ]);
};
