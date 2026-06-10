import { useCallback, useEffect, useMemo, useState } from "react";

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
import { buildProfileNavGroups } from "../lib/buildProfileNavGroups.js";
import {
  isFullWidthCatalogProfileTab,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_OVERVIEW,
} from "../lib/profileTabs.js";
import { MyProductsCatalogToolbar } from "../../home/ui/MyProductsCatalogToolbar.jsx";
import { getActiveProfileNavLabel } from "../lib/getActiveProfileNavLabel.js";
import { PROFILE_NAV_ITEM_META } from "../lib/profileNavItemMeta.js";
import { AppIcon, Menu } from "../../../shared/ui/icon/index.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { UserProfileInfoPanel } from "../../../entities/user/ui/UserProfileInfoPanel.jsx";
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
 * onInstallmentModerationClick?: () => void;
 * onInstallmentDisputesClick?: () => void;
 * onMyOrdersClick?: () => void;
 * onAuctionClick?: () => void;
 * onAdminOrdersClick?: () => void;
 * onSearchSynonymsAdminClick?: () => void;
 * onCategoryTreeAdminClick?: () => void;
 * onAppIntroAdminClick?: () => void;
 * onProductModerationClick?: () => void;
 * onProductReportsClick?: () => void;
 * onRafflesClick?: () => void;
 * onCreateRaffleClick?: () => void;
 * onDataConfirmationQueueClick?: () => void;
 * onDataConfirmationClick?: () => void;
 * onPremiumClick?: () => void;
 * onLoyaltyPointsClick?: () => void;
 * onAdvertisingClick?: () => void;
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
 * pendingInstallmentModerationCount?: number;
 * pendingInstallmentDisputesCount?: number;
 * pendingProductReportsCount?: number;
 * pendingDataConfirmationCount?: number;
 * onSubscriptionsClick?: () => void;
 * activeTab?: string;
 * onTabChange?: (tab: string) => void;
 * tabContent?: import('react').ReactNode;
 * myProductsCatalogToolbarProps?: import('../../home/ui/MyProductsCatalogToolbar.jsx').MyProductsCatalogToolbar extends (props: infer P) => unknown ? P : never;
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
  onSearchSynonymsAdminClick,
  onCategoryTreeAdminClick,
  onAppIntroAdminClick,
  onProductModerationClick,
  onProductReportsClick,
  onRafflesClick,
  onCreateRaffleClick,
  onDataConfirmationQueueClick,
  onDataConfirmationClick,
  onPremiumClick,
  onLoyaltyPointsClick,
  onAdvertisingClick,
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
  pendingInstallmentModerationCount = 0,
  pendingInstallmentDisputesCount = 0,
  pendingProductReportsCount = 0,
  pendingRafflesCount = 0,
  pendingDataConfirmationCount = 0,
  onSubscriptionsClick,
  activeTab = "overview",
  onTabChange,
  tabContent = null,
  myProductsCatalogToolbarProps = null,
}) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
  const profileBackground = user ? resolveUserProfileBackgroundFromUser(user) : null;
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
  const canUseInstallmentSales = isProfileReady && Boolean(onInstallmentSalesClick);
  const canUseMyOrders = isProfileReady && Boolean(onMyOrdersClick);
  const canUseAuction = isProfileReady && Boolean(onAuctionClick);
  const canUseEditProfile = isProfileReady && Boolean(onEditProfileClick);
  const isRegularUser = user?.userRole === USER_ROLE_USER;
  const canUseAdminOrders =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onAdminOrdersClick);
  const canUseSearchSynonymsAdmin =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onSearchSynonymsAdminClick);
  const canUseCategoryTreeAdmin =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onCategoryTreeAdminClick);
  const canUseAppIntroAdmin =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onAppIntroAdminClick);
  const isUserDataConfirmed = user?.isUserDataConfirmed === true;
  const canUseDataConfirmation = isProfileReady && Boolean(onDataConfirmationClick);
  const canUsePremium = isProfileReady && Boolean(onPremiumClick);
  const canUseLoyaltyPoints = isProfileReady && Boolean(onLoyaltyPointsClick);
  const canUseAdvertising = isProfileReady && Boolean(onAdvertisingClick);
  const canUseProductModeration =
    !isRegularUser && isProfileReady && Boolean(onProductModerationClick);
  const canUseProductReports =
    !isRegularUser && isProfileReady && Boolean(onProductReportsClick);
  const canUseRaffles = !isRegularUser && isProfileReady && Boolean(onRafflesClick);
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
  const isMyProductsTab = activeTab === PROFILE_TAB_MY_PRODUCTS;
  const isFullWidthCatalogTab = isFullWidthCatalogProfileTab(activeTab);
  const canShowBackground =
    Boolean(profileBackground) &&
    (profileBackground.kind === "preset" ||
      (profileBackground.kind === "image" && !backgroundLoadFailed));
  const showProfileBanner =
    Boolean(user) && (canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed));
  const showEditOnBanner =
    isRegularUser &&
    canUseEditProfile &&
    activeTab === PROFILE_TAB_OVERVIEW &&
    showProfileBanner;
  const navGroups = useMemo(
    () =>
      buildProfileNavGroups({
        canUseCreateRaffle,
        canUseMyProducts,
        canUseMySales,
        canUseMyOrders,
        canUseAuction,
        canUseInstallmentPayments,
        canUseInstallmentSales,
        canUseProductModeration,
        canUseProductReports,
        canUseRaffles,
        canUseDataConfirmationQueue,
        canUseInstallmentModeration,
        canUseInstallmentDisputes,
        canUseAdminOrders,
        canUseSearchSynonymsAdmin,
        canUseCategoryTreeAdmin,
        canUseAppIntroAdmin,
        canUseSubscriptions,
        canUseDataConfirmation,
        isUserDataConfirmed,
        canUsePremium,
        canUseLoyaltyPoints,
        canUseAdvertising,
        canUseEditProfile,
        showEditOnBanner,
        pendingMySalesActionCount,
        pendingMyOrdersActionCount,
        pendingIncomingPriceOffersCount,
        pendingInstallmentBuyerActionCount,
        pendingInstallmentSellerActionCount,
        pendingModerationCount,
        pendingIntroAdModerationCount,
        pendingSellerPersonalCategoryModerationCount,
        pendingProductReportsCount,
        pendingRafflesCount,
        pendingDataConfirmationCount,
        pendingInstallmentModerationCount,
        pendingInstallmentDisputesCount,
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
        onRafflesClick,
        onDataConfirmationQueueClick,
        onInstallmentModerationClick,
        onInstallmentDisputesClick,
        onAdminOrdersClick,
        onSearchSynonymsAdminClick,
        onCategoryTreeAdminClick,
        onAppIntroAdminClick,
        onSubscriptionsClick,
        onDataConfirmationClick,
        onPremiumClick,
        onLoyaltyPointsClick,
        onAdvertisingClick,
        onEditProfileClick,
      }),
    [
      canUseAdminOrders,
      canUseAuction,
      canUseAppIntroAdmin,
      canUseCategoryTreeAdmin,
      canUseCreateRaffle,
      canUseDataConfirmation,
      canUseDataConfirmationQueue,
      isUserDataConfirmed,
      canUseEditProfile,
      canUseInstallmentDisputes,
      canUseInstallmentModeration,
      canUseInstallmentPayments,
      canUseInstallmentSales,
      canUseLoyaltyPoints,
      canUseAdvertising,
      canUseMyOrders,
      canUseMyProducts,
      canUseMySales,
      canUsePremium,
      canUseProductModeration,
      canUseProductReports,
      canUseRaffles,
      canUseSearchSynonymsAdmin,
      canUseSubscriptions,
      onAdminOrdersClick,
      onAuctionClick,
      onAppIntroAdminClick,
      onCategoryTreeAdminClick,
      onCreateRaffleClick,
      onDataConfirmationClick,
      onDataConfirmationQueueClick,
      onEditProfileClick,
      onInstallmentDisputesClick,
      onInstallmentModerationClick,
      onInstallmentPaymentsClick,
      onInstallmentSalesClick,
      onLoyaltyPointsClick,
      onAdvertisingClick,
      onIntroAdModerationClick,
      onSellerPersonalCategoryModerationClick,
      onMyOrdersClick,
      onMyProductsClick,
      onMySalesClick,
      onPremiumClick,
      onProductModerationClick,
      onIntroAdModerationClick,
      onProductReportsClick,
      onRafflesClick,
      onSearchSynonymsAdminClick,
      onSubscriptionsClick,
      onTabChange,
      pendingDataConfirmationCount,
      pendingIncomingPriceOffersCount,
      pendingInstallmentBuyerActionCount,
      pendingInstallmentDisputesCount,
      pendingInstallmentModerationCount,
      pendingInstallmentSellerActionCount,
      pendingModerationCount,
      pendingIntroAdModerationCount,
      pendingSellerPersonalCategoryModerationCount,
      pendingMyOrdersActionCount,
      pendingMySalesActionCount,
      pendingProductReportsCount,
      pendingRafflesCount,
      showEditOnBanner,
    ],
  );
  const activeNavLabel = useMemo(
    () => getActiveProfileNavLabel(navGroups, activeTab),
    [activeTab, navGroups],
  );
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), []);

  useScrollLock(isMobileNavOpen);

  useEffect(() => {
    closeMobileNav();
  }, [activeTab, closeMobileNav]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMobileNav, isMobileNavOpen]);

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
    <section
      className={[
        "my-profile-page",
        isFullWidthCatalogTab ? "my-profile-page--catalog-grid-tab" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="my-profile-page__layout">
        <button
          type="button"
          className={[
            "my-profile-page__mobile-nav-backdrop",
            isMobileNavOpen && "my-profile-page__mobile-nav-backdrop--visible",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={MY_PROFILE_PAGE_UI.MOBILE_NAV_CLOSE_ARIA}
          tabIndex={isMobileNavOpen ? 0 : -1}
          onClick={closeMobileNav}
        />
        <div
          className={[
            "my-profile-page__sidebar-wrap",
            isMobileNavOpen && "my-profile-page__sidebar-wrap--open",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <ProfileSidebar
            id="my-profile-mobile-nav"
            groups={navGroups}
            activeTab={activeTab}
            onItemSelect={closeMobileNav}
          />
          <footer className="my-profile-page__sidebar-footer">
            {activeTab === PROFILE_TAB_OVERVIEW ? (
              !isLogoutConfirmOpen ? (
                <button
                  type="button"
                  className="my-profile-page__nav-button my-profile-page__nav-button_danger my-profile-page__logout-trigger"
                  data-tone={PROFILE_NAV_ITEM_META.logout.tone}
                  onClick={() => setIsLogoutConfirmOpen(true)}
                >
                  <span className="my-profile-page__nav-button-main">
                    <span className="my-profile-page__nav-icon" aria-hidden="true">
                      <AppIcon
                        icon={PROFILE_NAV_ITEM_META.logout.icon}
                        size="sm"
                        strokeWidth={2.25}
                      />
                    </span>
                    <span className="my-profile-page__nav-button-label">
                      {MY_PROFILE_PAGE_UI.LOGOUT}
                    </span>
                  </span>
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
        </div>

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
          </button>
          {isFullWidthCatalogTab ? (
            <>
              {isMyProductsTab && myProductsCatalogToolbarProps ? (
                <MyProductsCatalogToolbar {...myProductsCatalogToolbarProps} />
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
                  <UserProfileInfoPanel rows={rows} />
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
