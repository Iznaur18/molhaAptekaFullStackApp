import { useState } from "react";

import { MY_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { PROFILE_NAV_ITEM_META } from "../lib/profileNavItemMeta.js";

/**
 * @param {{
 *   onLogout: () => void | Promise<void>;
 * }} props
 */
export function ProfileSidebarLogout({ onLogout }) {
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
        onClick={() => setIsConfirmOpen(true)}
      >
        <span className="my-profile-page__nav-button-main">
          <span className="my-profile-page__nav-icon" aria-hidden="true">
            <AppIcon icon={PROFILE_NAV_ITEM_META.logout.icon} size="sm" strokeWidth={2.25} />
          </span>
          <span className="my-profile-page__nav-button-label">{MY_PROFILE_PAGE_UI.LOGOUT}</span>
        </span>
      </button>
    );
  }

  return (
    <div className="my-profile-page__logout-confirm">
      <p className="my-profile-page__logout-question">{MY_PROFILE_PAGE_UI.LOGOUT_CONFIRM}</p>
      <div className="my-profile-page__logout-actions">
        <button type="button" className="my-profile-page__logout-yes" onClick={handleConfirmLogout}>
          {MY_PROFILE_PAGE_UI.LOGOUT_YES}
        </button>
        <button
          type="button"
          className="my-profile-page__logout-cancel"
          onClick={() => setIsConfirmOpen(false)}
        >
          {MY_PROFILE_PAGE_UI.LOGOUT_CANCEL}
        </button>
      </div>
    </div>
  );
}
