import { useEffect, useMemo, useState } from "react";

import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { getUserProfileRows } from "../../../entities/user/lib/getUserProfileRows.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "../../../entities/user/lib/profileImageFocus.js";
import { resolveUserProfileBackgroundFromUser } from "../../../entities/user/lib/userBackgroundValue.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import { USER_ROLE_USER } from "../../../entities/user/model/userConstants.js";
import {
  DATA_CONFIRMATION_PAGE_UI,
  MY_PROFILE_PAGE_UI,
  PRODUCT_MODERATION_PAGE_UI,
  PRODUCT_PROMOTIONS_STAFF_PAGE_UI,
  RAFFLES_STAFF_PAGE_UI,
  PRODUCT_REPORTS_PAGE_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { PROFILE_TAB_OVERVIEW } from "../lib/profileTabs.js";

import "../../../entities/user/ui/UserDetailsModal.css";
import "./MyProfilePage.css";

/**
 * @param {{
 * user: import('../../../entities/user/model/types.js').UserPublicProfile | null;
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
 * onProductPromotionsClick?: () => void;
 * onRafflesClick?: () => void;
 * onCreateRaffleClick?: () => void;
 * onDataConfirmationQueueClick?: () => void;
 * onDataConfirmationClick?: () => void;
 * pendingModerationCount?: number;
 * pendingProductReportsCount?: number;
 * pendingProductPromotionsCount?: number;
 * pendingDataConfirmationCount?: number;
 * onSubscriptionsClick?: () => void;
 * activeTab?: string;
 * onTabChange?: (tab: string) => void;
 * tabContent?: import('react').ReactNode;
 * }} props
 */
export function MyProfilePage({
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
  onProductPromotionsClick,
  onRafflesClick,
  onCreateRaffleClick,
  onDataConfirmationQueueClick,
  onDataConfirmationClick,
  pendingModerationCount = 0,
  pendingProductReportsCount = 0,
  pendingProductPromotionsCount = 0,
  pendingRafflesCount = 0,
  pendingDataConfirmationCount = 0,
  onSubscriptionsClick,
  activeTab = "overview",
  onTabChange,
  tabContent = null,
}) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);
  const isProfileReady = Boolean(user) && !isLoading && !errorMessage;
  const photoUrl = user ? pickUserProfilePhotoUrl(user) : null;
  const avatarObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserAvatarFocus(user)),
    [user],
  );
  const backgroundObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserBackgroundFocus(user)),
    [user],
  );
  const profileBackground = user
    ? resolveUserProfileBackgroundFromUser(user)
    : null;
  const rows = useMemo(
    () =>
      user
        ? getUserProfileRows(user, { showAdminRole: false, hideMediaUrls: true })
        : [],
    [user],
  );
  const canUseMyProducts = isProfileReady && Boolean(onMyProductsClick);
  const canUseMySales = isProfileReady && Boolean(onMySalesClick);
  const canUseMyOrders = isProfileReady && Boolean(onMyOrdersClick);
  const canUseEditProfile = isProfileReady && Boolean(onEditProfileClick);
  const isRegularUser = user?.userRole === USER_ROLE_USER;
  const canUseAdminOrders =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onAdminOrdersClick);
  const canUseDataConfirmation = isProfileReady && user?.isUserDataConfirmed !== true;
  const canUseProductModeration =
    !isRegularUser && isProfileReady && Boolean(onProductModerationClick);
  const canUseProductReports =
    !isRegularUser && isProfileReady && Boolean(onProductReportsClick);
  const canUseProductPromotions =
    !isRegularUser && isProfileReady && Boolean(onProductPromotionsClick);
  const canUseRaffles =
    !isRegularUser && isProfileReady && Boolean(onRafflesClick);
  const canUseCreateRaffle =
    isProfileReady &&
    user?.isUserDataConfirmed === true &&
    Boolean(onCreateRaffleClick);
  const canUseDataConfirmationQueue =
    !isRegularUser && isProfileReady && Boolean(onDataConfirmationQueueClick);
  const canUseSubscriptions = isProfileReady && Boolean(onSubscriptionsClick);
  const moderationBadge =
    pendingModerationCount > 0
      ? PRODUCT_MODERATION_PAGE_UI.TAB_BADGE(pendingModerationCount)
      : null;
  const reportsBadge =
    pendingProductReportsCount > 0
      ? PRODUCT_REPORTS_PAGE_UI.TAB_BADGE(pendingProductReportsCount)
      : null;
  const dataConfirmationBadge =
    pendingDataConfirmationCount > 0
      ? DATA_CONFIRMATION_PAGE_UI.TAB_BADGE(pendingDataConfirmationCount)
      : null;
  const promotionsBadge =
    pendingProductPromotionsCount > 0
      ? PRODUCT_PROMOTIONS_STAFF_PAGE_UI.TAB_BADGE(pendingProductPromotionsCount)
      : null;
  const rafflesBadge =
    pendingRafflesCount > 0
      ? RAFFLES_STAFF_PAGE_UI.TAB_BADGE(pendingRafflesCount)
      : null;
  const canShowBackground =
    Boolean(profileBackground) &&
    (profileBackground.kind === "preset" ||
      (profileBackground.kind === "image" && !backgroundLoadFailed));
  const showProfileBanner =
    Boolean(user) && (canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed));
  const showEditOnBanner =
    isRegularUser &&
    canUseEditProfile &&
    activeTab === "overview" &&
    showProfileBanner;
  const showEditInHeader = canUseEditProfile && !showEditOnBanner;

  useEffect(() => {
    setAvatarLoadFailed(false);
    setBackgroundLoadFailed(false);
  }, [user?._id]);

  useEffect(() => {
    if (activeTab !== PROFILE_TAB_OVERVIEW) {
      setIsLogoutConfirmOpen(false);
    }
  }, [activeTab]);

  const tabButtonClassName = (tab) =>
    [
      "my-profile-page__header-action",
      activeTab === tab ? "my-profile-page__header-action_active" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <section className="my-profile-page">
      <header className="my-profile-page__header">
        <h2 className="my-profile-page__title">{MY_PROFILE_PAGE_UI.TAB_TITLE}</h2>
        <div className="my-profile-page__header-actions">
          {canUseCreateRaffle ? (
            <button
              type="button"
              className="my-profile-page__header-action my-profile-page__header-action_create-raffle"
              onClick={() => onCreateRaffleClick?.()}
            >
              {MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE}
            </button>
          ) : null}
          <button
            type="button"
            className={tabButtonClassName("my-products")}
            disabled={!canUseMyProducts}
            onClick={() => {
              onTabChange?.("my-products");
              onMyProductsClick?.();
            }}
          >
            {MY_PROFILE_PAGE_UI.TAB_MY_PRODUCTS}
          </button>
          <button
            type="button"
            className={tabButtonClassName("my-sales")}
            disabled={!canUseMySales}
            onClick={() => {
              onTabChange?.("my-sales");
              onMySalesClick?.();
            }}
          >
            {MY_PROFILE_PAGE_UI.TAB_MY_SALES}
          </button>
          <button
            type="button"
            className={tabButtonClassName("my-orders")}
            disabled={!canUseMyOrders}
            onClick={() => {
              onTabChange?.("my-orders");
              onMyOrdersClick?.();
            }}
          >
            {MY_PROFILE_PAGE_UI.TAB_MY_ORDERS}
          </button>
          {showEditInHeader ? (
            <button
              type="button"
              className="my-profile-page__header-action"
              onClick={() => onEditProfileClick?.()}
            >
              {MY_PROFILE_PAGE_UI.EDIT_PROFILE}
            </button>
          ) : null}
          {canUseProductModeration ? (
            <button
              type="button"
              className={`${tabButtonClassName("product-moderation")} my-profile-page__header-action_badge`}
              onClick={() => {
                onTabChange?.("product-moderation");
                onProductModerationClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_PRODUCT_MODERATION}
              {moderationBadge ? (
                <span className="my-profile-page__badge" aria-hidden="true">
                  {moderationBadge}
                </span>
              ) : null}
            </button>
          ) : null}
          {canUseProductReports ? (
            <button
              type="button"
              className={`${tabButtonClassName("product-reports")} my-profile-page__header-action_badge`}
              onClick={() => {
                onTabChange?.("product-reports");
                onProductReportsClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_PRODUCT_REPORTS}
              {reportsBadge ? (
                <span className="my-profile-page__badge" aria-hidden="true">
                  {reportsBadge}
                </span>
              ) : null}
            </button>
          ) : null}
          {canUseProductPromotions ? (
            <button
              type="button"
              className={`${tabButtonClassName("product-promotions")} my-profile-page__header-action_badge`}
              onClick={() => {
                onTabChange?.("product-promotions");
                onProductPromotionsClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_PRODUCT_PROMOTIONS}
              {promotionsBadge ? (
                <span className="my-profile-page__badge" aria-hidden="true">
                  {promotionsBadge}
                </span>
              ) : null}
            </button>
          ) : null}
          {canUseRaffles ? (
            <button
              type="button"
              className={`${tabButtonClassName("raffles")} my-profile-page__header-action_badge`}
              onClick={() => {
                onTabChange?.("raffles");
                onRafflesClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_RAFFLES}
              {rafflesBadge ? (
                <span className="my-profile-page__badge" aria-hidden="true">
                  {rafflesBadge}
                </span>
              ) : null}
            </button>
          ) : null}
          {canUseDataConfirmationQueue ? (
            <button
              type="button"
              className={`${tabButtonClassName("data-confirmation-requests")} my-profile-page__header-action_badge`}
              onClick={() => {
                onTabChange?.("data-confirmation-requests");
                onDataConfirmationQueueClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION}
              {dataConfirmationBadge ? (
                <span className="my-profile-page__badge" aria-hidden="true">
                  {dataConfirmationBadge}
                </span>
              ) : null}
            </button>
          ) : null}
          {canUseAdminOrders ? (
            <button
              type="button"
              className={tabButtonClassName("admin-orders")}
              onClick={() => {
                onTabChange?.("admin-orders");
                onAdminOrdersClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_ADMIN_ORDERS}
            </button>
          ) : null}
          <button
            type="button"
            className={tabButtonClassName("subscriptions")}
            disabled={!canUseSubscriptions}
            onClick={() => {
              onTabChange?.("subscriptions");
              onSubscriptionsClick?.();
            }}
          >
            {MY_PROFILE_PAGE_UI.TAB_SUBSCRIPTIONS}
          </button>
          <button
            type="button"
            className="my-profile-page__header-action"
            disabled={!canUseDataConfirmation}
            onClick={() => onDataConfirmationClick?.()}
          >
            {MY_PROFILE_PAGE_UI.DATA_CONFIRMATION}
          </button>
        </div>
      </header>

      <div className="my-profile-page__body">
        {isLoading ? (
          <p className="my-profile-page__state">{USER_DETAILS_MODAL_UI.LOADING_BODY}</p>
        ) : null}
        {errorMessage && !isLoading ? (
          <p className="my-profile-page__state my-profile-page__state_error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {isProfileReady && activeTab === "overview" ? (
          <>
            {showProfileBanner ? (
              <div
                className={
                  canShowBackground
                    ? "user-details-modal__banner user-details-modal__banner_has-bg"
                    : "user-details-modal__banner"
                }
              >
                {canShowBackground && profileBackground?.kind === "image" ? (
                  <img
                    className="user-details-modal__banner-image"
                    src={profileBackground.url}
                    alt=""
                    decoding="async"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    style={{ objectPosition: backgroundObjectPosition }}
                    onError={() => setBackgroundLoadFailed(true)}
                  />
                ) : null}
                {canShowBackground && profileBackground?.kind === "preset" ? (
                  <div
                    className="user-details-modal__banner-color"
                    style={{ backgroundColor: profileBackground.color }}
                    aria-hidden="true"
                  />
                ) : null}
                {photoUrl && !avatarLoadFailed ? (
                  <UserPremiumAvatar
                    className="user-details-modal__avatar user-details-modal__avatar_lead user-details-modal__avatar_on-banner"
                    src={photoUrl}
                    isPremium={Boolean(user?.isPremiumUser)}
                    objectPosition={avatarObjectPosition}
                    decoding="async"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : null}
                {showEditOnBanner ? (
                  <button
                    type="button"
                    className="my-profile-page__banner-edit"
                    onClick={() => onEditProfileClick?.()}
                  >
                    {MY_PROFILE_PAGE_UI.EDIT_PROFILE}
                  </button>
                ) : null}
              </div>
            ) : null}
            {tabContent ? (
              <div className="my-profile-page__tab-content my-profile-page__tab-content_lead">
                {tabContent}
              </div>
            ) : null}
            <dl className="user-details-modal__list">
              {rows.map((row) => (
                <div key={row.id} className="user-details-modal__row">
                  <dt className="user-details-modal__label">{row.label}</dt>
                  <dd className="user-details-modal__value">{row.value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}
        {isProfileReady && activeTab !== "overview" ? (
          <div className="my-profile-page__tab-content">{tabContent}</div>
        ) : null}
      </div>
      {activeTab === PROFILE_TAB_OVERVIEW ? (
        <footer className="my-profile-page__footer">
          {!isLogoutConfirmOpen ? (
            <button
              type="button"
              className="my-profile-page__logout-trigger"
              onClick={() => setIsLogoutConfirmOpen(true)}
            >
              {MY_PROFILE_PAGE_UI.LOGOUT}
            </button>
          ) : (
            <div className="my-profile-page__logout-confirm">
              <p className="my-profile-page__logout-question">
                {MY_PROFILE_PAGE_UI.LOGOUT_CONFIRM}
              </p>
              <div className="my-profile-page__logout-actions">
                <button
                  type="button"
                  className="my-profile-page__logout-yes"
                  onClick={() => {
                    void onLogout();
                    setIsLogoutConfirmOpen(false);
                  }}
                >
                  {MY_PROFILE_PAGE_UI.LOGOUT_YES}
                </button>
                <button
                  type="button"
                  className="my-profile-page__logout-cancel"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                >
                  {MY_PROFILE_PAGE_UI.LOGOUT_CANCEL}
                </button>
              </div>
            </div>
          )}
        </footer>
      ) : null}
    </section>
  );
}
