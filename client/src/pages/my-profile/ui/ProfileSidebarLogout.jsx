import { useState } from "react";

import { MY_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { PROFILE_NAV_ITEM_META } from "../lib/profileNavItemMeta.js";

/**
 * Пункт выхода с подтверждением на месте. Тексты переопределяются для
 * «Выйти из всех аккаунтов».
 *
 * @param {{
 *   onLogout: () => void | Promise<void>;
 *   label?: string;
 *   question?: string;
 *   confirmLabel?: string;
 *   cancelLabel?: string;
 *   disabled?: boolean;
 * }} props
 */
export function ProfileSidebarLogout({
  onLogout,
  label = MY_PROFILE_PAGE_UI.LOGOUT,
  question = MY_PROFILE_PAGE_UI.LOGOUT_CONFIRM,
  confirmLabel = MY_PROFILE_PAGE_UI.LOGOUT_YES,
  cancelLabel = MY_PROFILE_PAGE_UI.LOGOUT_CANCEL,
  disabled = false,
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirmLogout = () => {
    void onLogout();
    setIsConfirmOpen(false);
  };

  if (!isConfirmOpen) {
    return (
      <button
        type="button"
        className="my-profile-page__nav-button my-profile-page__nav-button_danger my-profile-page__logout-trigger"
        data-tone={PROFILE_NAV_ITEM_META.logout.tone}
        disabled={disabled}
        onClick={() => setIsConfirmOpen(true)}
      >
        <span className="my-profile-page__nav-button-main">
          <span className="my-profile-page__nav-icon" aria-hidden="true">
            <AppIcon
              icon={PROFILE_NAV_ITEM_META.logout.icon}
              size="sm"
              strokeWidth={2.25}
            />
          </span>
          <span className="my-profile-page__nav-button-label">{label}</span>
        </span>
      </button>
    );
  }

  return (
    <div className="my-profile-page__logout-confirm">
      <p className="my-profile-page__logout-question">{question}</p>
      <div className="my-profile-page__logout-actions">
        <button
          type="button"
          className="my-profile-page__logout-yes"
          onClick={handleConfirmLogout}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          className="my-profile-page__logout-cancel"
          onClick={() => setIsConfirmOpen(false)}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
