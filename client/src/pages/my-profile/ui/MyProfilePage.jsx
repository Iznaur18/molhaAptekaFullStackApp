import { createPortal } from "react-dom";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { SellerShareLinkButton } from "../../../entities/user/ui/SellerShareLinkButton.jsx";
import { isPremiumActive } from "../../../entities/user/lib/isPremiumActive.js";
import { USER_ROLE_USER } from "../../../entities/user/model/userConstants.js";
import { ThemePreferenceToggle } from "../../../features/theme-settings/ui/ThemePreferenceToggle.jsx";
import { WebPushSettingsToggle } from "../../../features/web-push/ui/WebPushSettingsToggle.jsx";
import {
  AUTH_UI,
  HEADER_NOTIFICATIONS_BUTTON_UI,
  MY_PROFILE_PAGE_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { PROFILE_TAB_OVERVIEW } from "../../../widgets/app-shell/lib/profileTabs.js";
import { MyProductsCatalogToolbar } from "../../../widgets/my-products-catalog-toolbar/ui/MyProductsCatalogToolbar.jsx";
import { MyProductsShelvesPanel } from "../../../entities/seller-shelf/ui/MyProductsShelvesPanel.jsx";
import { useMyProfileNav } from "../model/useMyProfileNav.js";
import { useMyProfilePageUi } from "../model/useMyProfilePageUi.js";
import { AppIcon, Bell, ChevronDown, Menu, Pencil } from "../../../shared/ui/icon/index.js";
import { buildSellerProductsPath } from "../../../shared/lib/sellerPaths.js";
import { UserProfileInfoPanel } from "../../../entities/user/ui/UserProfileInfoPanel.jsx";
import { GuestProfilePanel } from "./GuestProfilePanel.jsx";
import { ProfileSidebar } from "./ProfileSidebar.jsx";

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
 * onInstallmentDisputesClick?: () => void;
 * onMyOrdersClick?: () => void;
 * onAuctionClick?: () => void;
 * onAdminOrdersClick?: () => void;
 * onSearchSynonymsAdminClick?: () => void;
 * onCategoryTreeAdminClick?: () => void;
 * onAppIntroAdminClick?: () => void;
 * onSiteHeaderBannerAdminClick?: () => void;
 * onPopularProductsAdminClick?: () => void;
 * onProductModerationClick?: () => void;
 * onProductReportsClick?: () => void;
 * onProductPromotionsClick?: () => void;
 * onRafflesClick?: () => void;
 * onCreateRaffleClick?: () => void;
 * onCourierClick?: () => void;
 * onCourierModerationClick?: () => void;
 * onShipmentDisputesClick?: () => void;
 * onShippingCarriersClick?: () => void;
 * onCourierOverviewClick?: () => void;
 * onDataConfirmationQueueClick?: () => void;
 * onDataConfirmationClick?: () => void;
 * onPremiumClick?: () => void;
 * onLoyaltyPointsClick?: () => void;
 * onPartnerProgramClick?: () => void;
 * onAdvertisingClick?: () => void;
 * onOneCIntegrationClick?: () => void;
 * onDeliveryPaymentClick?: () => void;
 * onSafeDealClick?: () => void;
 * onSafeDealModerationClick?: () => void;
 * onIntroAdModerationClick?: () => void;
 * onSellerPersonalCategoryModerationClick?: () => void;
 * pendingIntroAdModerationCount?: number;
 * pendingSellerPersonalCategoryModerationCount?: number;
 * pendingModerationCount?: number;
 * pendingIncomingPriceOffersCount?: number;
 * pendingMySalesActionCount?: number;
 * pendingMyOrdersActionCount?: number;
 * pendingInstallmentBuyerActionCount?: number;
 * pendingInstallmentSellerActionCount?: number;
 * pendingInstallmentDisputesCount?: number;
 * pendingProductReportsCount?: number;
 * pendingProductPromotionsCount?: number;
 * pendingRafflesCount?: number;
 * pendingDataConfirmationCount?: number;
 * unreadNotificationsCount?: number;
 * onSubscriptionsClick?: () => void;
 * onWishlistClick?: () => void;
 * activeTab?: string;
 * onTabChange?: (tab: string) => void;
 * tabContent?: import('react').ReactNode;
 * myProductsCatalogToolbarProps?: import('../../../widgets/my-products-catalog-toolbar/ui/MyProductsCatalogToolbar.jsx').MyProductsCatalogToolbar extends (props: infer P) => unknown ? P : never;
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
  onInstallmentDisputesClick,
  onMyOrdersClick,
  onAuctionClick,
  onAdminOrdersClick,
  onSearchSynonymsAdminClick,
  onCategoryTreeAdminClick,
  onAppIntroAdminClick,
  onSiteHeaderBannerAdminClick,
  onPopularProductsAdminClick,
  onProductModerationClick,
  onProductReportsClick,
  onProductPromotionsClick,
  onRafflesClick,
  onCreateRaffleClick,
  onCourierClick,
  onCourierModerationClick,
  onShipmentDisputesClick,
  onShippingCarriersClick,
  onCourierOverviewClick,
  onDataConfirmationQueueClick,
  onDataConfirmationClick,
  onPremiumClick,
  onLoyaltyPointsClick,
  onPartnerProgramClick,
  onAdvertisingClick,
  onOneCIntegrationClick,
  onDeliveryPaymentClick,
  onSafeDealClick,
  onSafeDealModerationClick,
  onIntroAdModerationClick,
  onSellerPersonalCategoryModerationClick,
  pendingModerationCount = 0,
  pendingIntroAdModerationCount = 0,
  pendingSellerPersonalCategoryModerationCount = 0,
  pendingIncomingPriceOffersCount = 0,
  pendingMySalesActionCount = 0,
  pendingMyOrdersActionCount = 0,
  pendingInstallmentBuyerActionCount = 0,
  pendingInstallmentSellerActionCount = 0,
  pendingInstallmentDisputesCount = 0,
  pendingProductReportsCount = 0,
  pendingProductPromotionsCount = 0,
  pendingRafflesCount = 0,
  pendingDataConfirmationCount = 0,
  unreadNotificationsCount = 0,
  onSubscriptionsClick,
  onWishlistClick,
  activeTab = "overview",
  onTabChange,
  tabContent = null,
  myProductsCatalogToolbarProps = null,
}) {
  const navigate = useNavigate();
  const isGuestProfile =
    !user && !isLoading && !errorMessage && activeTab === PROFILE_TAB_OVERVIEW;
  const isGuestOtherTab = !user && !isLoading && !errorMessage && !isGuestProfile;
  const isProfileReady = Boolean(user) && !isLoading && !errorMessage;
  const canUseEditProfile = isProfileReady && Boolean(onEditProfileClick);
  const isRegularUser = user?.userRole === USER_ROLE_USER;

  const {
    rows,
    photoUrl,
    avatarObjectPosition,
    backgroundObjectPosition,
    profileBackground,
    canShowBackground,
    showProfileBanner,
    showEditOnBanner,
    isMyProductsTab,
    isProductModerationTab,
    isFullWidthCatalogTab,
    isDrawerLayout,
    isMobileNavOpen,
    isMobileNavMounted,
    isMobileNavVisible,
    closeMobileNav,
    openMobileNav,
    avatarLoadFailed,
    setAvatarLoadFailed,
    setBackgroundLoadFailed,
  } = useMyProfilePageUi({
    user,
    isProfileReady,
    activeTab,
    canUseEditProfile,
    isRegularUser,
  });

  const { navGroups, activeNavLabel } = useMyProfileNav({
    user,
    isProfileReady,
    activeTab,
    showEditOnBanner,
    pendingModerationCount,
    pendingIntroAdModerationCount,
    pendingSellerPersonalCategoryModerationCount,
    pendingIncomingPriceOffersCount,
    pendingMySalesActionCount,
    pendingMyOrdersActionCount,
    pendingInstallmentBuyerActionCount,
    pendingInstallmentSellerActionCount,
    pendingInstallmentDisputesCount,
    pendingProductReportsCount,
    pendingProductPromotionsCount,
    pendingRafflesCount,
    pendingDataConfirmationCount,
    onTabChange,
    onCreateRaffleClick,
    onMyProductsClick,
    onMySalesClick,
    onMyOrdersClick,
    onAuctionClick,
    onInstallmentPaymentsClick,
    onInstallmentSalesClick,
    onProductModerationClick,
    onIntroAdModerationClick,
    onSellerPersonalCategoryModerationClick,
    onProductReportsClick,
    onProductPromotionsClick,
    onRafflesClick,
    onCourierClick,
    onCourierModerationClick,
    onShipmentDisputesClick,
  onShippingCarriersClick,
    onCourierOverviewClick,
    onDataConfirmationQueueClick,
    onInstallmentDisputesClick,
    onAdminOrdersClick,
    onSearchSynonymsAdminClick,
    onCategoryTreeAdminClick,
    onAppIntroAdminClick,
    onSiteHeaderBannerAdminClick,
    onPopularProductsAdminClick,
    onSubscriptionsClick,
    onWishlistClick,
    onDataConfirmationClick,
    onPremiumClick,
    onLoyaltyPointsClick,
    onPartnerProgramClick,
    onAdvertisingClick,
    onOneCIntegrationClick,
    onDeliveryPaymentClick,
    onSafeDealClick,
    onSafeDealModerationClick,
    onEditProfileClick,
  });

  if (isGuestProfile) {
    return <GuestProfilePanel />;
  }

  if (isGuestOtherTab) {
    return (
      <p className="my-profile-page__state" role="status">
        {AUTH_UI.GUEST_STATUS}
      </p>
    );
  }

  return (
    <section
      className={[
        "my-profile-page",
        isFullWidthCatalogTab ? "my-profile-page--catalog-grid-tab" : "",
        isMyProductsTab ? "my-profile-page--my-products" : "",
        isProductModerationTab ? "my-profile-page--product-moderation" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="my-profile-page__layout">
        {isDrawerLayout
          ? isMobileNavMounted
            ? createPortal(
                <div
                  className={[
                    "my-profile-page__mobile-nav-portal",
                    isMobileNavVisible && "my-profile-page__mobile-nav-portal--open",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="presentation"
                >
                  <button
                    type="button"
                    className="my-profile-page__mobile-nav-backdrop"
                    aria-label={MY_PROFILE_PAGE_UI.MOBILE_NAV_CLOSE_ARIA}
                    tabIndex={isMobileNavVisible ? 0 : -1}
                    onClick={closeMobileNav}
                  />
                  <div className="my-profile-page__sidebar-wrap">
                    <ProfileSidebar
                      id="my-profile-mobile-nav"
                      groups={navGroups}
                      activeTab={activeTab}
                      onItemSelect={closeMobileNav}
                      onLogout={onLogout}
                      user={user}
                    />
                  </div>
                </div>,
                document.body,
              )
            : null
          : (
              <div className="my-profile-page__sidebar-wrap">
                <ProfileSidebar
                  id="my-profile-mobile-nav"
                  groups={navGroups}
                  activeTab={activeTab}
                  onItemSelect={closeMobileNav}
                  onLogout={onLogout}
                  user={user}
                />
              </div>
            )}

        <div className="my-profile-page__main">
          <button
            type="button"
            className="my-profile-page__mobile-nav-toggle"
            aria-label={MY_PROFILE_PAGE_UI.MOBILE_NAV_TOGGLE_ARIA}
            aria-expanded={isMobileNavOpen}
            aria-controls="my-profile-mobile-nav"
            onClick={openMobileNav}
          >
            <span className="my-profile-page__mobile-nav-toggle-icon" aria-hidden="true">
              <Menu size={20} strokeWidth={2.25} />
            </span>
            <span className="my-profile-page__mobile-nav-toggle-text">
              <span className="my-profile-page__mobile-nav-toggle-caption">
                {MY_PROFILE_PAGE_UI.MOBILE_NAV_CURRENT_SECTION}
              </span>
              <span className="my-profile-page__mobile-nav-toggle-label">{activeNavLabel}</span>
            </span>
            <span className="my-profile-page__mobile-nav-toggle-chevron" aria-hidden="true">
              <ChevronDown size={24} strokeWidth={2.25} />
            </span>
          </button>
          {isFullWidthCatalogTab ? (
            <>
              {isMyProductsTab && myProductsCatalogToolbarProps ? (
                <>
                  <MyProductsShelvesPanel />
                  <MyProductsCatalogToolbar {...myProductsCatalogToolbarProps} />
                </>
              ) : null}
              <div className="my-profile-page__catalog-shell">
                {isLoading ? (
                  <p className="my-profile-page__state">
                    {USER_DETAILS_MODAL_UI.LOADING_BODY}
                  </p>
                ) : null}
                {errorMessage && !isLoading ? (
                  <p
                    className="my-profile-page__state my-profile-page__state_error"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                ) : null}
                {isProfileReady ? tabContent : null}
              </div>
            </>
          ) : (
            <div className="my-profile-page__body">
              {isLoading ? (
                <p className="my-profile-page__state">
                  {USER_DETAILS_MODAL_UI.LOADING_BODY}
                </p>
              ) : null}
              {errorMessage && !isLoading ? (
                <p
                  className="my-profile-page__state my-profile-page__state_error"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}
              {isProfileReady && activeTab === PROFILE_TAB_OVERVIEW ? (
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
                        <div className="my-profile-page__banner-actions">
                          <button
                            type="button"
                            className="my-profile-page__banner-edit"
                            aria-label={MY_PROFILE_PAGE_UI.EDIT_PROFILE}
                            onClick={() => onEditProfileClick?.()}
                          >
                            <AppIcon icon={Pencil} size="sm" strokeWidth={2.25} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {user?._id ? (
                    <div className="my-profile-page__quick-actions">
                      <SellerShareLinkButton
                        sellerId={String(user._id)}
                        sellerName={String(user.userName ?? "").trim()}
                        variant="meta"
                      />
                      <button
                        type="button"
                        className="my-profile-page__storefront-btn"
                        onClick={() =>
                          navigate(buildSellerProductsPath(String(user._id)))
                        }
                      >
                        <AppIcon icon={Store} size="sm" strokeWidth={2.1} />
                        <span className="my-profile-page__storefront-btn-text">
                          {MY_PROFILE_PAGE_UI.MY_STOREFRONT}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="my-profile-page__notifications-btn"
                        aria-label={HEADER_NOTIFICATIONS_BUTTON_UI.ARIA}
                        onClick={() => navigate("/notifications")}
                      >
                        <AppIcon icon={Bell} size="lg" strokeWidth={2.1} />
                        {unreadNotificationsCount > 0 ? (
                          <span
                            className="my-profile-page__notifications-badge"
                            aria-label={HEADER_NOTIFICATIONS_BUTTON_UI.COUNT_ARIA}
                          >
                            {HEADER_NOTIFICATIONS_BUTTON_UI.BADGE(
                              unreadNotificationsCount,
                            )}
                          </span>
                        ) : null}
                      </button>
                    </div>
                  ) : null}
                  {tabContent ? (
                    <div className="my-profile-page__tab-content my-profile-page__tab-content_lead">
                      {tabContent}
                    </div>
                  ) : null}
                  <UserProfileInfoPanel rows={rows} />
                  <div className="my-profile-page__overview-footer">
                    <ThemePreferenceToggle />
                    <WebPushSettingsToggle isAuthorized={Boolean(isProfileReady)} />
                  </div>
                </>
              ) : null}
              {isProfileReady && activeTab !== PROFILE_TAB_OVERVIEW ? (
                <div className="my-profile-page__tab-content">{tabContent}</div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
