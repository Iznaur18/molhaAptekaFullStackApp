import { useEffect, useRef } from "react";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../entities/product/model/productConstants.js";
import { CatalogCategoryFilterButton } from "../../widgets/catalog-category-filter-button/ui/CatalogCategoryFilterButton.jsx";
import { CatalogMenuButton } from "../../widgets/catalog-menu-button/ui/CatalogMenuButton.jsx";
import { HeaderCartButton } from "../../widgets/header-cart-button/ui/HeaderCartButton.jsx";
import { HeaderWishlistButton } from "../../widgets/header-wishlist-button/ui/HeaderWishlistButton.jsx";
import { HeaderNotificationsButton } from "../../widgets/header-notifications-button/ui/HeaderNotificationsButton.jsx";
import { HeaderPlaceProductButton } from "../../widgets/header-place-product-button/ui/HeaderPlaceProductButton.jsx";
import { HeaderProfileButton } from "../../widgets/header-profile-button/ui/HeaderProfileButton.jsx";
import { HeaderShowHiddenProductsButton } from "../../widgets/header-show-hidden-products-button/ui/HeaderShowHiddenProductsButton.jsx";
import { HeaderUsersButton } from "../../widgets/header-users-button/ui/HeaderUsersButton.jsx";
import {
  DATA_CONFIRMATION_PAGE_UI,
  HOME_PAGE_UI,
  INSTALLMENT_UI,
  PRODUCT_MODERATION_PAGE_UI,
  PRODUCT_REPORTS_PAGE_UI,
  PRODUCT_SEARCH_INPUT_UI,
} from "../../shared/config/appUiCopy.js";
import { getAppShellHeaderVariantClass } from "../lib/appShellVariant.js";
import { isProfileTabMainView } from "../../widgets/app-shell/lib/profileTabToMainView.js";
import {
  isCatalogBrowserMainView,
  isCatalogHeaderMainView,
} from "../../shared/lib/homeMainViewPaths.js";
import { MobileBottomNav } from "../../widgets/mobile-bottom-nav/ui/MobileBottomNav.jsx";
import { useAppShellCompactLayout } from "../../shared/lib/useAppShellCompactLayout.js";
import { useScrollLock } from "../../shared/lib/useScrollLock.js";
import { SearchInput } from "../../shared/ui/SearchInput/SearchInput.jsx";
import { SiteHeaderBannerCarousel } from "../../entities/site-header-banner/ui/SiteHeaderBannerCarousel.jsx";
import { useSiteHeaderBannerSlidesQuery } from "../../entities/site-header-banner/model/useSiteHeaderBannerSlidesQuery.js";

const PRODUCT_CATEGORY_FILTER_LIST_ID = HOME_PAGE_UI.PRODUCT_CATEGORY_FILTER_LIST_ID;

/** Разделы с подписью в кнопках шапки — без дублирующего view-title. */
const HEADER_VIEW_TITLE_HIDDEN_VIEWS = new Set(["users", "cart"]);

function isHeaderViewTitleHidden(mainView) {
  return HEADER_VIEW_TITLE_HIDDEN_VIEWS.has(mainView) || isProfileTabMainView(mainView);
}

const NON_CATALOG_VIEW_TITLES = {
  "my-profile": HOME_PAGE_UI.AUTH_MY_PROFILE,
  users: HOME_PAGE_UI.TITLE_USERS,
  subscriptions: HOME_PAGE_UI.TITLE_SUBSCRIPTIONS,
  wishlist: HOME_PAGE_UI.TITLE_WISHLIST,
  cart: HOME_PAGE_UI.TITLE_CART,
  "my-sales": HOME_PAGE_UI.TITLE_MY_SALES,
  "my-orders": HOME_PAGE_UI.TITLE_MY_ORDERS,
  "admin-orders": HOME_PAGE_UI.TITLE_ADMIN_ORDERS,
  "product-moderation": HOME_PAGE_UI.TITLE_PRODUCT_MODERATION,
  "intro-ad-moderation": HOME_PAGE_UI.TITLE_INTRO_AD_MODERATION,
  "seller-personal-category-moderation":
    HOME_PAGE_UI.TITLE_SELLER_PERSONAL_CATEGORY_MODERATION,
  advertising: HOME_PAGE_UI.TITLE_ADVERTISING,
  "product-reports": HOME_PAGE_UI.TITLE_PRODUCT_REPORTS,
  "data-confirmation-requests": HOME_PAGE_UI.TITLE_DATA_CONFIRMATION,
  "installment-payments": HOME_PAGE_UI.TITLE_INSTALLMENT_PAYMENTS,
  "installment-sales": HOME_PAGE_UI.TITLE_INSTALLMENT_SALES,
  "installment-disputes": HOME_PAGE_UI.TITLE_INSTALLMENT_DISPUTES,
  notifications: HOME_PAGE_UI.TITLE_NOTIFICATIONS,
};

/**
 * @param {{
 *   mainView: import('../../shared/lib/homeMainViewPaths.js').HomeMainView;
 *   isMineMode: boolean;
 *   selectedProductCategory: import('../../entities/product/model/types.js').ProductCategory | null;
 *   isProductCategoryListOpen: boolean;
 *   onCatalogMenuClick: () => void;
 *   isCatalogMenuActive?: boolean;
 *   productSearchTerm: string;
 *   isProductSearchPending: boolean;
 *   isAuthorized: boolean;
 *   onSetMainView: (view: import('../../shared/lib/homeMainViewPaths.js').HomeMainView) => void;
 *   onProductCategorySelect: (category: import('../../entities/product/model/types.js').ProductCategory | null) => void;
 *   onProductCategoryFilterToggle: () => void;
 *   onCloseProductCategoryFilter: () => void;
 *   onProductSearchTermChange: (next: string) => void;
 *   onPlaceProductClick: () => void;
 *   onMyProfileClick: () => void;
 *   onNotificationsClick: () => void;
 *   unreadNotificationsCount?: number;
 *   onLoginClick: () => void;
 *   onRegisterClick: () => void;
 *   onNavigateToFullCatalogFromBreadcrumb: () => void;
 *   onMobileCartClick: () => void;
 *   canModerateProducts?: boolean;
 *   showHiddenCatalogProducts: boolean;
 *   onShowHiddenCatalogProductsToggle: () => void;
 *   pendingModerationCount?: number;
 *   pendingInstallmentDisputesCount?: number;
 *   pendingProductReportsCount?: number;
 *   pendingDataConfirmationCount?: number;
 *   showSiteHeaderBanner?: boolean;
 * }} props
 */
export function AppShellHeader({
  mainView,
  isMineMode,
  selectedProductCategory,
  isProductCategoryListOpen,
  onCatalogMenuClick,
  isCatalogMenuActive = false,
  productSearchTerm,
  isProductSearchPending,
  isAuthorized,
  onSetMainView,
  onProductCategorySelect,
  onProductCategoryFilterToggle,
  onCloseProductCategoryFilter,
  onProductSearchTermChange,
  onPlaceProductClick,
  onMyProfileClick,
  onNotificationsClick,
  unreadNotificationsCount = 0,
  onLoginClick,
  onRegisterClick,
  onNavigateToFullCatalogFromBreadcrumb,
  onMobileCartClick,
  canModerateProducts = false,
  showHiddenCatalogProducts,
  onShowHiddenCatalogProductsToggle,
  pendingModerationCount = 0,
  pendingInstallmentDisputesCount = 0,
  pendingProductReportsCount = 0,
  pendingDataConfirmationCount = 0,
  showSiteHeaderBanner = false,
}) {
  /** @type {import('react').RefObject<HTMLDivElement | null>} */
  const productCategoryFilterRef = useRef(null);

  useEffect(() => {
    if (!isProductCategoryListOpen) return undefined;

    const handlePointerDown = (event) => {
      const root = productCategoryFilterRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        onCloseProductCategoryFilter();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isProductCategoryListOpen, onCloseProductCategoryFilter]);

  useScrollLock(isProductCategoryListOpen);

  const isCatalogHeaderView = isCatalogHeaderMainView(mainView);
  const isPublicCatalogHeader = !isMineMode && isCatalogHeaderView;
  const isUsersNavActive = mainView === "users";
  const isCartNavActive = mainView === "cart";
  const isWishlistNavActive = mainView === "wishlist";
  const isMyProfileNavActive = isProfileTabMainView(mainView);
  const isNotificationsNavActive = mainView === "notifications";
  const isHomeNavActive = mainView === "catalog";
  const isCatalogNavActive =
    isCatalogBrowserMainView(mainView) || isCatalogMenuActive;

  const nonCatalogTitle = (() => {
    const base = NON_CATALOG_VIEW_TITLES[mainView] ?? "";
    if (mainView === "product-moderation" && pendingModerationCount > 0) {
      return `${base} (${PRODUCT_MODERATION_PAGE_UI.TAB_BADGE(pendingModerationCount)})`;
    }
    if (mainView === "product-reports" && pendingProductReportsCount > 0) {
      return `${base} (${PRODUCT_REPORTS_PAGE_UI.TAB_BADGE(pendingProductReportsCount)})`;
    }
    if (mainView === "data-confirmation-requests" && pendingDataConfirmationCount > 0) {
      return `${base} (${DATA_CONFIRMATION_PAGE_UI.TAB_BADGE(pendingDataConfirmationCount)})`;
    }
    if (mainView === "installment-disputes" && pendingInstallmentDisputesCount > 0) {
      return `${base} (${INSTALLMENT_UI.TAB_BADGE(pendingInstallmentDisputesCount)})`;
    }
    return base;
  })();

  const headerViewTitle = isHeaderViewTitleHidden(mainView) ? "" : nonCatalogTitle;

  const isMobileNav = useAppShellCompactLayout();
  const showSiteHeaderBannerOnViewport = showSiteHeaderBanner && isMobileNav;
  const slidesQuery = useSiteHeaderBannerSlidesQuery({
    enabled: showSiteHeaderBannerOnViewport,
  });
  const siteHeaderBannerSlides = showSiteHeaderBannerOnViewport
    ? (slidesQuery.data ?? [])
    : [];

  const headerClassName = [
    "app-shell__header",
    getAppShellHeaderVariantClass(),
    isMobileNav && "app-shell__header--mobile-split",
  ]
    .filter(Boolean)
    .join(" ");

  const navActionsProps = {
    canModerateProducts,
    showHiddenCatalogProducts,
    onShowHiddenCatalogProductsToggle,
    isUsersNavActive,
    onSetMainView,
    isCartNavActive,
    isWishlistNavActive,
    isAuthorized,
    onPlaceProductClick,
    onLoginClick,
    isMyProfileNavActive,
    onMyProfileClick,
    isNotificationsNavActive,
    unreadNotificationsCount,
    onNotificationsClick,
    onRegisterClick,
  };

  const catalogFilterProps = {
    isPublicCatalogHeader,
    isCatalogMenuActive,
    onCatalogMenuClick,
    isProductCategoryListOpen,
    selectedProductCategory,
    onProductCategoryFilterToggle,
    onProductCategorySelect,
    productCategoryFilterRef,
  };

  return (
    <>
      <header className={headerClassName}>
        <div className="app-shell__header-panel">
          <div className="app-shell__header-top">
            <div className="app-shell__header-main">
              <HomeHeaderTitleRow
                isCatalogHeaderView={isCatalogHeaderView}
                headerViewTitle={headerViewTitle}
                onNavigateToFullCatalogFromBreadcrumb={
                  onNavigateToFullCatalogFromBreadcrumb
                }
              />
              <div className="app-shell__header-search">
                <SearchInput
                  value={productSearchTerm}
                  onChange={onProductSearchTermChange}
                  placeholder={PRODUCT_SEARCH_INPUT_UI.PLACEHOLDER}
                  ariaLabel={PRODUCT_SEARCH_INPUT_UI.ARIA_LABEL}
                  clearAriaLabel={PRODUCT_SEARCH_INPUT_UI.CLEAR_ARIA}
                  pendingAriaLabel={PRODUCT_SEARCH_INPUT_UI.PENDING_ARIA}
                  isPending={isProductSearchPending}
                />
              </div>
              {isCatalogHeaderView && !isMobileNav ? (
                <CatalogHeaderFilter {...catalogFilterProps} />
              ) : null}
            </div>
            <HeaderNavActions
              {...navActionsProps}
              variant={isMobileNav ? "mobile-top" : "desktop"}
            />
          </div>
        </div>
        {siteHeaderBannerSlides.length > 0 ? (
          <SiteHeaderBannerCarousel slides={siteHeaderBannerSlides} />
        ) : null}
      </header>
      {isMobileNav ? (
        <MobileBottomNav
          isHomeActive={isHomeNavActive}
          isCatalogActive={isCatalogNavActive}
          isCartActive={isCartNavActive}
          isProfileActive={isMyProfileNavActive}
          isAuthorized={isAuthorized}
          onHomeClick={onNavigateToFullCatalogFromBreadcrumb}
          onCatalogClick={onCatalogMenuClick}
          onPlaceProductClick={onPlaceProductClick}
          onLoginClick={onLoginClick}
          onCartClick={onMobileCartClick}
          onProfileClick={onMyProfileClick}
        />
      ) : null}
    </>
  );
}

/**
 * @param {{
 *   isPublicCatalogHeader: boolean;
 *   isCatalogMenuActive: boolean;
 *   onCatalogMenuClick: () => void;
 *   isProductCategoryListOpen: boolean;
 *   selectedProductCategory: import('../../entities/product/model/types.js').ProductCategory | null;
 *   onProductCategoryFilterToggle: () => void;
 *   onProductCategorySelect: (category: import('../../entities/product/model/types.js').ProductCategory | null) => void;
 *   productCategoryFilterRef: import('react').RefObject<HTMLDivElement | null>;
 * }} props
 */
function CatalogHeaderFilter({
  isPublicCatalogHeader,
  isCatalogMenuActive,
  onCatalogMenuClick,
  isProductCategoryListOpen,
  selectedProductCategory,
  onProductCategoryFilterToggle,
  onProductCategorySelect,
  productCategoryFilterRef,
}) {
  return (
    <div
      className={[
        "app-shell__header-filter",
        isPublicCatalogHeader && "app-shell__header-filter--public",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={productCategoryFilterRef}
    >
      {isPublicCatalogHeader ? (
        <CatalogMenuButton isActive={isCatalogMenuActive} onClick={onCatalogMenuClick} />
      ) : (
        <>
          <CatalogCategoryFilterButton
            isOpen={isProductCategoryListOpen}
            selectedProductCategory={selectedProductCategory}
            listId={PRODUCT_CATEGORY_FILTER_LIST_ID}
            onClick={onProductCategoryFilterToggle}
            mode="category"
          />
          {isProductCategoryListOpen ? (
            <ul
              id={PRODUCT_CATEGORY_FILTER_LIST_ID}
              className="app-shell__category-list"
              role="list"
              onWheel={(event) => event.stopPropagation()}
            >
              <li className="app-shell__category-item">
                <button
                  type="button"
                  className="app-shell__category-option"
                  onClick={() => onProductCategorySelect(null)}
                >
                  {HOME_PAGE_UI.CATEGORY_ALL}
                </button>
              </li>
              {PRODUCT_CATEGORIES.map((category) => (
                <li key={category} className="app-shell__category-item">
                  <button
                    type="button"
                    className="app-shell__category-option"
                    onClick={() => onProductCategorySelect(category)}
                  >
                    {PRODUCT_CATEGORY_LABEL_RU[category]}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * @param {{
 *   variant: "desktop" | "mobile-top";
 *   canModerateProducts: boolean;
 *   showHiddenCatalogProducts: boolean;
 *   onShowHiddenCatalogProductsToggle: () => void;
 *   isUsersNavActive: boolean;
 *   onSetMainView: (view: import('../../shared/lib/homeMainViewPaths.js').HomeMainView) => void;
 *   isCartNavActive: boolean;
 *   isWishlistNavActive: boolean;
 *   isAuthorized: boolean;
 *   onPlaceProductClick: () => void;
 *   onLoginClick: () => void;
 *   isMyProfileNavActive: boolean;
 *   onMyProfileClick: () => void;
 *   isNotificationsNavActive: boolean;
 *   unreadNotificationsCount: number;
 *   onNotificationsClick: () => void;
 *   onRegisterClick: () => void;
 * }} props
 */
function HeaderNavActions({
  variant,
  canModerateProducts,
  showHiddenCatalogProducts,
  onShowHiddenCatalogProductsToggle,
  isUsersNavActive,
  onSetMainView,
  isCartNavActive,
  isWishlistNavActive,
  isAuthorized,
  onPlaceProductClick,
  onLoginClick,
  isMyProfileNavActive,
  onMyProfileClick,
  isNotificationsNavActive,
  unreadNotificationsCount,
  onNotificationsClick,
  onRegisterClick,
}) {
  const navClassName = [
    "app-shell__auth-actions",
    variant === "mobile-top" && "app-shell__auth-actions--mobile-top",
    variant === "desktop" && "app-shell__auth-actions--desktop",
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "mobile-top") {
    return (
      <nav className={navClassName} aria-label={HOME_PAGE_UI.NAV_AUTH_ARIA}>
        <HeaderUsersButton
          isActive={isUsersNavActive}
          onClick={() => onSetMainView("users")}
        />
      </nav>
    );
  }

  const showNotifications = variant === "desktop";

  return (
    <nav className={navClassName} aria-label={HOME_PAGE_UI.NAV_AUTH_ARIA}>
      {canModerateProducts ? (
        <HeaderShowHiddenProductsButton
          isActive={showHiddenCatalogProducts}
          onClick={onShowHiddenCatalogProductsToggle}
        />
      ) : null}
      <HeaderUsersButton
        isActive={isUsersNavActive}
        onClick={() => onSetMainView("users")}
      />
      {isAuthorized ? (
        <HeaderWishlistButton
          isActive={isWishlistNavActive}
          onClick={() => onSetMainView("wishlist")}
        />
      ) : null}
      <HeaderCartButton isActive={isCartNavActive} onClick={() => onSetMainView("cart")} />
      <HeaderPlaceProductButton
        isLoginRequired={!isAuthorized}
        onClick={() => (isAuthorized ? onPlaceProductClick() : onLoginClick())}
      />
      {isAuthorized ? (
        <>
          <HeaderProfileButton isActive={isMyProfileNavActive} onClick={onMyProfileClick} />
          {showNotifications ? (
            <HeaderNotificationsButton
              isActive={isNotificationsNavActive}
              unreadCount={unreadNotificationsCount}
              onClick={onNotificationsClick}
            />
          ) : null}
        </>
      ) : (
        <>
          <button
            type="button"
            className="app-shell__auth-button app-shell__auth-button_secondary"
            onClick={onLoginClick}
          >
            {HOME_PAGE_UI.AUTH_LOGIN}
          </button>
          <button
            type="button"
            className="app-shell__auth-button"
            onClick={onRegisterClick}
          >
            {HOME_PAGE_UI.AUTH_REGISTER}
          </button>
        </>
      )}
    </nav>
  );
}

/**
 * @param {{
 *   isCatalogHeaderView: boolean;
 *   headerViewTitle: string;
 *   onNavigateToFullCatalogFromBreadcrumb: () => void;
 * }} props
 */
function HomeHeaderTitleRow({
  isCatalogHeaderView,
  headerViewTitle,
  onNavigateToFullCatalogFromBreadcrumb,
}) {
  return (
    <div className="app-shell__title-row">
      <h1 className="app-shell__title app-shell__title_inline">
        <button
          type="button"
          className="app-shell__brand-button"
          onClick={onNavigateToFullCatalogFromBreadcrumb}
          aria-label={HOME_PAGE_UI.NAV_TO_HOME}
        >
          <img
            className="app-shell__logo"
            src={HOME_PAGE_UI.LOGO_SRC}
            alt={HOME_PAGE_UI.LOGO_ALT}
            width={120}
            height={40}
            decoding="async"
          />
        </button>
      </h1>
      {!isCatalogHeaderView && headerViewTitle ? (
        <span className="app-shell__view-title">{headerViewTitle}</span>
      ) : null}
    </div>
  );
}
