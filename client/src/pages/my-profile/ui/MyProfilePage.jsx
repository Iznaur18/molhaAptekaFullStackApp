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
import { isPremiumActive } from "../../../entities/user/lib/isPremiumActive.js";
import { USER_ROLE_USER } from "../../../entities/user/model/userConstants.js";
import {
  MY_PROFILE_PAGE_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { PROFILE_TAB_OVERVIEW } from "../lib/profileTabs.js";
import { ProfileTabBadge } from "./ProfileTabBadge.jsx";

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
 * onInstallmentPaymentsClick?: () => void;
 * onInstallmentSalesClick?: () => void;
 * onInstallmentModerationClick?: () => void;
 * onInstallmentDisputesClick?: () => void;
 * onMyOrdersClick?: () => void;
 * onAuctionClick?: () => void;
 * onAdminOrdersClick?: () => void;
 * onProductModerationClick?: () => void;
 * onProductReportsClick?: () => void;
 * onProductPromotionsClick?: () => void;
 * onRafflesClick?: () => void;
 * onCreateRaffleClick?: () => void;
 * onDataConfirmationQueueClick?: () => void;
 * onDataConfirmationClick?: () => void;
 * onPremiumClick?: () => void;
 * onLoyaltyPointsClick?: () => void;
 * pendingModerationCount?: number;
 * pendingIncomingPriceOffersCount?: number;
 * pendingMySalesActionCount?: number;
 * pendingMyOrdersActionCount?: number;
 * pendingInstallmentBuyerActionCount?: number;
 * pendingInstallmentSellerActionCount?: number;
 * pendingInstallmentModerationCount?: number;
 * pendingInstallmentDisputesCount?: number;
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
  onInstallmentPaymentsClick,
  onInstallmentSalesClick,
  onInstallmentModerationClick,
  onInstallmentDisputesClick,
  onMyOrdersClick,
  onAuctionClick,
  onAdminOrdersClick,
  onProductModerationClick,
  onProductReportsClick,
  onProductPromotionsClick,
  onRafflesClick,
  onCreateRaffleClick,
  onDataConfirmationQueueClick,
  onDataConfirmationClick,
  onPremiumClick,
  onLoyaltyPointsClick,
  pendingModerationCount = 0,
  pendingIncomingPriceOffersCount = 0,
  pendingMySalesActionCount = 0,
  pendingMyOrdersActionCount = 0,
  pendingInstallmentBuyerActionCount = 0,
  pendingInstallmentSellerActionCount = 0,
  pendingInstallmentModerationCount = 0,
  pendingInstallmentDisputesCount = 0,
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
  const canUseInstallmentPayments =
    isProfileReady && Boolean(onInstallmentPaymentsClick);
  const canUseInstallmentSales =
    isProfileReady && Boolean(onInstallmentSalesClick);
  const canUseMyOrders = isProfileReady && Boolean(onMyOrdersClick);
  const canUseAuction = isProfileReady && Boolean(onAuctionClick);
  const canUseEditProfile = isProfileReady && Boolean(onEditProfileClick);
  const isRegularUser = user?.userRole === USER_ROLE_USER;
  const canUseAdminOrders =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onAdminOrdersClick);
  const canUseDataConfirmation = isProfileReady && user?.isUserDataConfirmed !== true;
  const canUsePremium = isProfileReady && Boolean(onPremiumClick);
  const canUseLoyaltyPoints = isProfileReady && Boolean(onLoyaltyPointsClick);
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
  const canUseInstallmentModeration =
    !isRegularUser && isProfileReady && Boolean(onInstallmentModerationClick);
  const canUseInstallmentDisputes =
    !isRegularUser && isProfileReady && Boolean(onInstallmentDisputesClick);
  const canUseSubscriptions = isProfileReady && Boolean(onSubscriptionsClick);
  const tabButtonClassName = (tab, withBadge = false) =>
    [
      "my-profile-page__header-action",
      activeTab === tab ? "my-profile-page__header-action_active" : "",
      withBadge ? "my-profile-page__header-action_badge" : "",
    ]
      .filter(Boolean)
      .join(" ");
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
  useEffect(() => {
    setAvatarLoadFailed(false);
    setBackgroundLoadFailed(false);
  }, [user?._id]);

  useEffect(() => {
    if (activeTab !== PROFILE_TAB_OVERVIEW) {
      setIsLogoutConfirmOpen(false);
    }
  }, [activeTab]);

  return (
    <section className="my-profile-page">
      <header className="my-profile-page__header">
        <h2 className="my-profile-page__title">{MY_PROFILE_PAGE_UI.TAB_TITLE}</h2>
        <div className="my-profile-page__header-actions">
          <div className="my-profile-page__header-tabs-row">
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
            className={tabButtonClassName("my-sales", pendingMySalesActionCount > 0)}
            disabled={!canUseMySales}
            onClick={() => {
              onTabChange?.("my-sales");
              onMySalesClick?.();
            }}
          >
            {MY_PROFILE_PAGE_UI.TAB_MY_SALES}
            <ProfileTabBadge count={pendingMySalesActionCount} />
          </button>
          <button
            type="button"
            className={tabButtonClassName("my-orders", pendingMyOrdersActionCount > 0)}
            disabled={!canUseMyOrders}
            onClick={() => {
              onTabChange?.("my-orders");
              onMyOrdersClick?.();
            }}
          >
            {MY_PROFILE_PAGE_UI.TAB_MY_ORDERS}
            <ProfileTabBadge count={pendingMyOrdersActionCount} />
          </button>
          {canUseAuction ? (
            <button
              type="button"
              className={tabButtonClassName(
                "auction",
                pendingIncomingPriceOffersCount > 0,
              )}
              onClick={() => {
                onTabChange?.("auction");
                onAuctionClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_AUCTION}
              <ProfileTabBadge count={pendingIncomingPriceOffersCount} />
            </button>
          ) : null}
          {canUseInstallmentPayments ? (
            <button
              type="button"
              className={tabButtonClassName(
                "installment-payments",
                pendingInstallmentBuyerActionCount > 0,
              )}
              onClick={() => {
                onTabChange?.("installment-payments");
                onInstallmentPaymentsClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_PAYMENTS}
              <ProfileTabBadge count={pendingInstallmentBuyerActionCount} />
            </button>
          ) : null}
          {canUseInstallmentSales ? (
            <button
              type="button"
              className={tabButtonClassName(
                "installment-sales",
                pendingInstallmentSellerActionCount > 0,
              )}
              onClick={() => {
                onTabChange?.("installment-sales");
                onInstallmentSalesClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_SALES}
              <ProfileTabBadge count={pendingInstallmentSellerActionCount} />
            </button>
          ) : null}
          {canUseProductModeration ? (
            <button
              type="button"
              className={tabButtonClassName(
                "product-moderation",
                pendingModerationCount > 0,
              )}
              onClick={() => {
                onTabChange?.("product-moderation");
                onProductModerationClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_PRODUCT_MODERATION}
              <ProfileTabBadge count={pendingModerationCount} />
            </button>
          ) : null}
          {canUseProductReports ? (
            <button
              type="button"
              className={tabButtonClassName(
                "product-reports",
                pendingProductReportsCount > 0,
              )}
              onClick={() => {
                onTabChange?.("product-reports");
                onProductReportsClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_PRODUCT_REPORTS}
              <ProfileTabBadge count={pendingProductReportsCount} />
            </button>
          ) : null}
          {canUseProductPromotions ? (
            <button
              type="button"
              className={tabButtonClassName(
                "product-promotions",
                pendingProductPromotionsCount > 0,
              )}
              onClick={() => {
                onTabChange?.("product-promotions");
                onProductPromotionsClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_PRODUCT_PROMOTIONS}
              <ProfileTabBadge count={pendingProductPromotionsCount} />
            </button>
          ) : null}
          {canUseRaffles ? (
            <button
              type="button"
              className={tabButtonClassName("raffles", pendingRafflesCount > 0)}
              onClick={() => {
                onTabChange?.("raffles");
                onRafflesClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_RAFFLES}
              <ProfileTabBadge count={pendingRafflesCount} />
            </button>
          ) : null}
          {canUseDataConfirmationQueue ? (
            <button
              type="button"
              className={tabButtonClassName(
                "data-confirmation-requests",
                pendingDataConfirmationCount > 0,
              )}
              onClick={() => {
                onTabChange?.("data-confirmation-requests");
                onDataConfirmationQueueClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION}
              <ProfileTabBadge count={pendingDataConfirmationCount} />
            </button>
          ) : null}
          {canUseInstallmentModeration ? (
            <button
              type="button"
              className={tabButtonClassName(
                "installment-moderation",
                pendingInstallmentModerationCount > 0,
              )}
              onClick={() => {
                onTabChange?.("installment-moderation");
                onInstallmentModerationClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_MODERATION}
              <ProfileTabBadge count={pendingInstallmentModerationCount} />
            </button>
          ) : null}
          {canUseInstallmentDisputes ? (
            <button
              type="button"
              className={tabButtonClassName(
                "installment-disputes",
                pendingInstallmentDisputesCount > 0,
              )}
              onClick={() => {
                onTabChange?.("installment-disputes");
                onInstallmentDisputesClick?.();
              }}
            >
              {MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_DISPUTES}
              <ProfileTabBadge count={pendingInstallmentDisputesCount} />
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
          </div>
          <div className="my-profile-page__header-account-row">
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
            {canUsePremium ? (
              <button
                type="button"
                className={tabButtonClassName("premium")}
                onClick={() => {
                  onTabChange?.("premium");
                  onPremiumClick?.();
                }}
              >
                {MY_PROFILE_PAGE_UI.TAB_PREMIUM}
              </button>
            ) : null}
            {canUseLoyaltyPoints ? (
              <button
                type="button"
                className={tabButtonClassName("loyalty-points")}
                onClick={() => {
                  onTabChange?.("loyalty-points");
                  onLoyaltyPointsClick?.();
                }}
              >
                {MY_PROFILE_PAGE_UI.TAB_LOYALTY_POINTS}
              </button>
            ) : null}
            {canUseEditProfile && !showEditOnBanner ? (
              <button
                type="button"
                className="my-profile-page__header-action"
                onClick={() => onEditProfileClick?.()}
              >
                {MY_PROFILE_PAGE_UI.EDIT_PROFILE}
              </button>
            ) : null}
          </div>
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
                    isPremium={isPremiumActive(user)}
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
      <footer className="my-profile-page__footer">
        {activeTab === PROFILE_TAB_OVERVIEW ? (
          !isLogoutConfirmOpen ? (
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
          )
        ) : null}
      </footer>
    </section>
  );
}
