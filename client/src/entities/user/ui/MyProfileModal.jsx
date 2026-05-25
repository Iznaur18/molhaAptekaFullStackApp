import { useEffect, useState } from "react";

import { UserDetailsModal } from "./UserDetailsModal.jsx";

import {
  DATA_CONFIRMATION_PAGE_UI,
  IN_APP_NOTIFICATIONS_UI,
  MY_PROFILE_MODAL_UI,
  PRODUCT_REPORTS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { markInAppNotificationsRead } from "../api/markInAppNotificationsRead.js";

import "./MyProfileModal.css";

/**
 * @param {{
 * isOpen: boolean;
 * onClose: () => void;
 * user: import('../model/types.js').UserPublicProfile | null;
 * isLoading?: boolean;
 * errorMessage?: string | null;
 * onLogout: () => void | Promise<void>;
 * onEditProfileClick?: () => void;
 * onMyProductsClick?: () => void;
 * onMySalesClick?: () => void;
 * onMyOrdersClick?: () => void;
 * onAdminOrdersClick?: () => void;
 * onProductModerationClick?: () => void;
 * onProductReportsClick?: () => void;
 * onDataConfirmationQueueClick?: () => void;
 * onDataConfirmationClick?: () => void;
 * pendingProductReportsCount?: number;
 * pendingDataConfirmationCount?: number;
 * inAppNotifications?: import('../../product-report/model/types.js').UserInAppNotification[];
 * onNotificationsRead?: () => void;
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
  onProductModerationClick,
  onProductReportsClick,
  onDataConfirmationQueueClick,
  onDataConfirmationClick,
  pendingProductReportsCount = 0,
  pendingDataConfirmationCount = 0,
  inAppNotifications = [],
  onNotificationsRead,
}) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsLogoutConfirmOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || inAppNotifications.length === 0) return undefined;
    void (async () => {
      try {
        await markInAppNotificationsRead();
        onNotificationsRead?.();
      } catch {
        // не блокируем профиль
      }
    })();
    return undefined;
  }, [isOpen, inAppNotifications.length, onNotificationsRead]);

  const showLogoutBlock = !isLoading;
  const isProfileReady = Boolean(user) && !isLoading && !errorMessage;
  const showEditProfile =
    isProfileReady && typeof onEditProfileClick === "function";
  const canUseMyProducts = isProfileReady && Boolean(onMyProductsClick);
  const canUseMySales = isProfileReady && Boolean(onMySalesClick);
  const canUseMyOrders = isProfileReady && Boolean(onMyOrdersClick);
  const canUseAdminOrders =
    isProfileReady && Boolean(onAdminOrdersClick) && user?.userRole === "admin";
  const canUseProductModeration =
    isProfileReady && Boolean(onProductModerationClick);
  const canUseProductReports =
    isProfileReady && Boolean(onProductReportsClick);
  const canUseDataConfirmationQueue =
    isProfileReady && Boolean(onDataConfirmationQueueClick);
  const canUseDataConfirmation =
    isProfileReady &&
    Boolean(onDataConfirmationClick) &&
    user?.isUserDataConfirmed !== true;
  const isProfileTabActive = !isLoading;
  const reportsBadge =
    pendingProductReportsCount > 0
      ? PRODUCT_REPORTS_PAGE_UI.TAB_BADGE(pendingProductReportsCount)
      : null;
  const dataConfirmationBadge =
    pendingDataConfirmationCount > 0
      ? DATA_CONFIRMATION_PAGE_UI.TAB_BADGE(pendingDataConfirmationCount)
      : null;

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
      {canUseDataConfirmation ? (
        <button
          type="button"
          className="my-profile-modal__edit-profile"
          onClick={() => onDataConfirmationClick?.()}
        >
          {MY_PROFILE_MODAL_UI.DATA_CONFIRMATION}
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
                  void onLogout();
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
      {canUseProductModeration ? (
        <button
          type="button"
          className="my-profile-modal__header-action"
          onClick={() => onProductModerationClick?.()}
        >
          {MY_PROFILE_MODAL_UI.TAB_PRODUCT_MODERATION}
        </button>
      ) : null}
      {canUseProductReports ? (
        <button
          type="button"
          className="my-profile-modal__header-action my-profile-modal__header-action_badge"
          onClick={() => onProductReportsClick?.()}
        >
          {MY_PROFILE_MODAL_UI.TAB_PRODUCT_REPORTS}
          {reportsBadge ? (
            <span className="my-profile-modal__badge" aria-hidden="true">
              {reportsBadge}
            </span>
          ) : null}
        </button>
      ) : null}
      {canUseDataConfirmationQueue ? (
        <button
          type="button"
          className="my-profile-modal__header-action my-profile-modal__header-action_badge"
          onClick={() => onDataConfirmationQueueClick?.()}
        >
          {MY_PROFILE_MODAL_UI.TAB_DATA_CONFIRMATION}
          {dataConfirmationBadge ? (
            <span className="my-profile-modal__badge" aria-hidden="true">
              {dataConfirmationBadge}
            </span>
          ) : null}
        </button>
      ) : null}
    </div>
  );

  const notificationsSlot =
    inAppNotifications.length > 0 ? (
      <div
        className="my-profile-modal__notifications"
        role="region"
        aria-label={IN_APP_NOTIFICATIONS_UI.SECTION_ARIA}
      >
        <ul className="my-profile-modal__notifications-list" role="list">
          {inAppNotifications.map((item) => (
            <li key={item._id} role="listitem">
              {item.message}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

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
      notificationsSlot={notificationsSlot}
      footer={footer}
      layoutVariant="register"
      showAdminRole={user?.userRole === "admin"}
    />
  );
}
