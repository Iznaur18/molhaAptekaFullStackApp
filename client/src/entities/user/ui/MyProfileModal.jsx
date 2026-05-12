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
 * onEditProfileClick?: () => void;
 * onMyProductsClick?: () => void;
 * onMySalesClick?: () => void;
 * onMyOrdersClick?: () => void;
 * onAdminOrdersClick?: () => void;
 * }} props
 */
export function MyProfileModal({
  isOpen,
  onClose,
  user,
  isLoading = false,
  errorMessage = null,
  onLogout,
  onEditProfileClick,
  onMyProductsClick,
  onMySalesClick,
  onMyOrdersClick,
  onAdminOrdersClick,
}) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsLogoutConfirmOpen(false);
  }, [isOpen]);

  const showLogoutBlock = !isLoading;
  const isProfileReady = Boolean(user) && !isLoading && !errorMessage;
  const showEditProfile =
    isProfileReady && typeof onEditProfileClick === "function";

  const footer = showLogoutBlock ? (
    <div className="my-profile-modal__footer-row">
      {showEditProfile ? (
        <button
          type="button"
          className="my-profile-modal__edit-profile"
          onClick={onEditProfileClick}
        >
          {MY_PROFILE_MODAL_UI.EDIT_PROFILE}
        </button>
      ) : null}
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
    </div>
  ) : null;

  const canUseMyProducts = isProfileReady && Boolean(onMyProductsClick);
  const canUseMySales = isProfileReady && Boolean(onMySalesClick);
  const canUseMyOrders = isProfileReady && Boolean(onMyOrdersClick);
  const canUseAdminOrders =
    isProfileReady && Boolean(onAdminOrdersClick) && user?.userRole === "admin";
  const isProfileTabActive = !isLoading;

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
    <div className="my-profile-modal__header-actions">
      <button
        type="button"
        className="my-profile-modal__header-action"
        disabled={!canUseMyProducts}
        onClick={() => onMyProductsClick?.()}
      >
        {MY_PROFILE_MODAL_UI.TAB_MY_PRODUCTS}
      </button>
      <button
        type="button"
        className="my-profile-modal__header-action"
        disabled={!canUseMySales}
        onClick={() => onMySalesClick?.()}
      >
        {MY_PROFILE_MODAL_UI.TAB_MY_SALES}
      </button>
      <button
        type="button"
        className="my-profile-modal__header-action"
        disabled={!canUseMyOrders}
        onClick={() => onMyOrdersClick?.()}
      >
        {MY_PROFILE_MODAL_UI.TAB_MY_ORDERS}
      </button>
      {canUseAdminOrders ? (
        <button
          type="button"
          className="my-profile-modal__header-action"
          onClick={() => onAdminOrdersClick?.()}
        >
          {MY_PROFILE_MODAL_UI.TAB_ADMIN_ORDERS}
        </button>
      ) : null}
    </div>
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
