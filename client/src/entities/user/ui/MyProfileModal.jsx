import { useEffect, useState } from "react";

import { UserDetailsModal } from "./UserDetailsModal.jsx";

import { MY_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./MyProfileModal.css";

/**
 * @param {{
 * isOpen: boolean;
 * onClose: () => void;
 * user: import('../model/types.js').UserPublicProfile | null;
 * isLoading?: boolean;
 * errorMessage?: string | null;
 * onLogout: () => void;
 * onMyProductsClick?: () => void;
 * }} props
 */
export function MyProfileModal({
  isOpen,
  onClose,
  user,
  isLoading = false,
  errorMessage = null,
  onLogout,
  onMyProductsClick,
}) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsLogoutConfirmOpen(false);
  }, [isOpen]);

  const showLogoutBlock = !isLoading;

  const footer = showLogoutBlock ? (
    <div className="my-profile-modal__logout">
      {!isLogoutConfirmOpen ? (
        <button
          type="button"
          className="my-profile-modal__logout-trigger"
          onClick={() => setIsLogoutConfirmOpen(true)}
        >
          {MY_PROFILE_MODAL_UI.LOGOUT}
        </button>
      ) : (
        <div className="my-profile-modal__logout-confirm">
          <p className="my-profile-modal__logout-question">
            {MY_PROFILE_MODAL_UI.LOGOUT_CONFIRM}
          </p>
          <div className="my-profile-modal__logout-actions">
            <button
              type="button"
              className="my-profile-modal__logout-yes"
              onClick={() => {
                onLogout();
                setIsLogoutConfirmOpen(false);
              }}
            >
              {MY_PROFILE_MODAL_UI.LOGOUT_YES}
            </button>
            <button
              type="button"
              className="my-profile-modal__logout-cancel"
              onClick={() => setIsLogoutConfirmOpen(false)}
            >
              {MY_PROFILE_MODAL_UI.LOGOUT_CANCEL}
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null;

  const canUseMyProducts = Boolean(user) && !isLoading && !errorMessage;
  const isProfileTabActive = !isLoading;

  const handleMyProductsClick = () => {
    onMyProductsClick?.();
  };

  const profileTitleClassName = [
    "my-profile-modal__header-action",
    "my-profile-modal__header-action_lead",
    isProfileTabActive ? "my-profile-modal__header-action_active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const titleSlot = (
    <button
      type="button"
      id="user-details-modal-title"
      className={profileTitleClassName}
      disabled={isLoading}
      onClick={() => {}}
    >
      {MY_PROFILE_MODAL_UI.TAB_TITLE}
    </button>
  );

  const titleAccessory = (
    <button
      type="button"
      className="my-profile-modal__header-action"
      disabled={!canUseMyProducts}
      onClick={handleMyProductsClick}
    >
      {MY_PROFILE_MODAL_UI.TAB_MY_PRODUCTS}
    </button>
  );

  return (
    <UserDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      user={user}
      isLoading={isLoading}
      errorMessage={errorMessage}
      titleOverride=""
      titleSlot={titleSlot}
      titleAccessory={titleAccessory}
      footer={footer}
      layoutVariant="register"
    />
  );
}
