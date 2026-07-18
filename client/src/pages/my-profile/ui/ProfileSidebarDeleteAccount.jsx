import { useState } from "react";

import { AdminDeleteUserConfirmModal } from "../../../entities/user/ui/AdminDeleteUserConfirmModal.jsx";
import { CART_STORAGE_KEY } from "../../../entities/order/model/constants.js";
import { DELETE_ACCOUNT_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { PROFILE_NAV_ITEM_META } from "../lib/profileNavItemMeta.js";

/**
 * Самоудаление аккаунта из сайдбара профиля — рядом с выходом.
 *
 * @param {{
 *   user: import('../../../entities/user/model/types.js').UserPublicProfile | null;
 * }} props
 */
export function ProfileSidebarDeleteAccount({ user }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!user?._id) return null;

  /**
   * Аккаунта больше нет, cookie погашены сервером. Полная перезагрузка —
   * самый надёжный сброс: ни react-query, ни контексты не переживут её
   * со стухшей сессией.
   */
  const handleDeleted = () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // storage недоступен
    }
    window.location.assign("/");
  };

  return (
    <>
      <button
        type="button"
        className="my-profile-page__nav-button my-profile-page__nav-button_danger"
        onClick={() => setIsConfirmOpen(true)}
      >
        <span className="my-profile-page__nav-button-main">
          <span className="my-profile-page__nav-icon" aria-hidden="true">
            <AppIcon
              icon={PROFILE_NAV_ITEM_META["delete-account"].icon}
              size="sm"
              strokeWidth={2.25}
            />
          </span>
          <span className="my-profile-page__nav-button-label">
            {DELETE_ACCOUNT_UI.NAV_BUTTON}
          </span>
        </span>
      </button>

      <AdminDeleteUserConfirmModal
        isOpen={isConfirmOpen}
        user={user}
        copy={DELETE_ACCOUNT_UI}
        onClose={() => setIsConfirmOpen(false)}
        onDeleted={handleDeleted}
      />
    </>
  );
}
