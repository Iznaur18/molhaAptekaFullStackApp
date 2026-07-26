import { useEffect, useRef } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { useProductCategoryRootsQuery } from "../../entities/product-category-tree/model/useProductCategoryRootsQuery.js";
import { CatalogCategoryFilterButton } from "../../widgets/catalog-category-filter-button/ui/CatalogCategoryFilterButton.jsx";
import { CatalogMenuButton } from "../../widgets/catalog-menu-button/ui/CatalogMenuButton.jsx";
import { HeaderWishlistButton } from "../../widgets/header-wishlist-button/ui/HeaderWishlistButton.jsx";
import { HeaderNotificationsButton } from "../../widgets/header-notifications-button/ui/HeaderNotificationsButton.jsx";
import { HeaderUsersButton } from "../../widgets/header-users-button/ui/HeaderUsersButton.jsx";
import { HeaderUsersStretchMenu } from "../../widgets/header-users-stretch-menu/ui/HeaderUsersStretchMenu.jsx";
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
import {
  isFaqPath,
  parseLegalKindFromPathname,
} from "../../shared/lib/infoPagePaths.js";

/**
 * @param {import('../../entities/product-category-tree/model/types.js').ProductCategoryNode} root
 */
function getCatalogHeaderFilterCategoryValue(root) {
  if (
    typeof root.legacyProductCategory === "string" &&
    root.legacyProductCategory.trim()
  ) {
    return root.legacyProductCategory.trim();
  }
  return root.slug;
}

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
 *   onProductSearchSubmit: () => void;
 *   onPlaceProductClick: () => void;
 *   onMyProfileClick: () => void;
 *   onNotificationsClick: () => void;
 *   unreadNotificationsCount?: number;
 *   onLoginClick: () => void;
 *   onRegisterClick: () => void;
 *   onNavigateToFullCatalogFromBreadcrumb: () => void;
 *   onMobileCartClick: () => void;
 *   pendingModerationCount?: number;
 *   pendingInstallmentDisputesCount?: number;
 *   pendingProductReportsCount?: number;
 *   pendingDataConfirmationCount?: number;
 *   showSiteHeaderBanner?: boolean;
 *   isCatalogBrowserLanding?: boolean;
 *   showHeaderPanel?: boolean;
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
  onProductSearchSubmit,
  onPlaceProductClick,
  onMyProfileClick,
  onNotificationsClick,
  unreadNotificationsCount = 0,
  onLoginClick,
  onRegisterClick: _onRegisterClick,
  onNavigateToFullCatalogFromBreadcrumb,
  onMobileCartClick,
  pendingModerationCount = 0,
  pendingInstallmentDisputesCount = 0,
  pendingProductReportsCount = 0,
  pendingDataConfirmationCount = 0,
  showSiteHeaderBanner = false,
  isCatalogBrowserLanding = false,
  showHeaderPanel = true,
}) {
  /** @type {import('react').RefObject<HTMLDivElement | null>} */
  const productCategoryFilterRef = useRef(null);
  const isMobileNav = useAppShellCompactLayout();
  const hideProductSearch = isMobileNav && isCatalogBrowserLanding;

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

  const slidesQuery = useSiteHeaderBannerSlidesQuery({
    enabled: showSiteHeaderBanner,
  });
  const siteHeaderBannerSlides = showSiteHeaderBanner ? (slidesQuery.data ?? []) : [];

  const hideHeaderPanel =
    !showHeaderPanel ||
    isProfileTabMainView(mainView) ||
    mainView === "cart" ||
    mainView === "catalog-browser";

  const headerClassName = [
    "app-shell__header",
    getAppShellHeaderVariantClass(),
    isMobileNav && "app-shell__header--mobile-split",
    hideHeaderPanel && "app-shell__header--no-panel",
  ]
    .filter(Boolean)
    .join(" ");

  const navActionsProps = {
    isUsersNavActive,
    onSetMainView,
    isWishlistNavActive,
    isAuthorized,
    isNotificationsNavActive,
    unreadNotificationsCount,
    onNotificationsClick,
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
      {showHeaderPanel ? (
        <header className={headerClassName}>
          {hideHeaderPanel ? null : (
            <div className="app-shell__header-panel">
              <div className="app-shell__header-top">
                <div className="app-shell__header-main">
                  {isMobileNav ? null : (
                    <HomeHeaderTitleRow
                      isCatalogHeaderView={isCatalogHeaderView}
                      headerViewTitle={headerViewTitle}
                      onNavigateToFullCatalogFromBreadcrumb={
                        onNavigateToFullCatalogFromBreadcrumb
                      }
                    />
                  )}
                  <div className="app-shell__header-search">
                    {hideProductSearch ? null : (
                      <SearchInput
                        value={productSearchTerm}
                        onChange={onProductSearchTermChange}
                        onSubmit={onProductSearchSubmit}
                        placeholder={PRODUCT_SEARCH_INPUT_UI.PLACEHOLDER}
                        ariaLabel={PRODUCT_SEARCH_INPUT_UI.ARIA_LABEL}
                        clearAriaLabel={PRODUCT_SEARCH_INPUT_UI.CLEAR_ARIA}
                        pendingAriaLabel={PRODUCT_SEARCH_INPUT_UI.PENDING_ARIA}
                        isPending={isProductSearchPending}
                        showLeadingIcon={isMobileNav}
                      />
                    )}
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
          )}
          {siteHeaderBannerSlides.length > 0 ? (
            <SiteHeaderBannerCarousel slides={siteHeaderBannerSlides} />
          ) : null}
        </header>
      ) : null}
      <MobileBottomNav
        isHomeActive={isHomeNavActive}
        isCatalogActive={isCatalogNavActive}
        isCartActive={isCartNavActive}
        isProfileActive={isMyProfileNavActive}
        isAuthorized={isAuthorized}
        unreadNotificationsCount={unreadNotificationsCount}
        onHomeClick={onNavigateToFullCatalogFromBreadcrumb}
        onCatalogClick={onCatalogMenuClick}
        onPlaceProductClick={onPlaceProductClick}
        onLoginClick={onLoginClick}
        onCartClick={onMobileCartClick}
        onProfileClick={onMyProfileClick}
      />
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
  const categoryRootsQuery = useProductCategoryRootsQuery({
    enabled: !isPublicCatalogHeader,
  });
  const categoryRoots = categoryRootsQuery.data ?? [];

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
              {categoryRoots.map((root) => {
                const categoryValue = getCatalogHeaderFilterCategoryValue(root);

                return (
                  <li key={root.id} className="app-shell__category-item">
                    <button
                      type="button"
                      className="app-shell__category-option"
                      onClick={() => onProductCategorySelect(categoryValue)}
                    >
                      {root.labelRu || root.slug}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * Secondary header actions. Primary nav (home/catalog/+/cart/profile) — в bottom bar.
 * @param {{
 *   variant: "desktop" | "mobile-top";
 *   isUsersNavActive: boolean;
 *   onSetMainView: (view: import('../../shared/lib/homeMainViewPaths.js').HomeMainView) => void;
 *   isWishlistNavActive: boolean;
 *   isAuthorized: boolean;
 *   isNotificationsNavActive: boolean;
 *   unreadNotificationsCount: number;
 *   onNotificationsClick: () => void;
 * }} props
 */
function HeaderNavActions({
  variant,
  isUsersNavActive,
  onSetMainView,
  isWishlistNavActive,
  isAuthorized,
  isNotificationsNavActive,
  unreadNotificationsCount,
  onNotificationsClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isTermsNavActive = parseLegalKindFromPathname(location.pathname) === "terms";
  const isFaqNavActive = isFaqPath(location.pathname);
  const stretchActiveItemKey = isUsersNavActive
    ? "users"
    : isTermsNavActive
      ? "terms"
      : isFaqNavActive
        ? "faq"
        : null;

  const handleStretchItemAction = (action) => {
    if (action === "users") {
      onSetMainView("users");
      return;
    }
    if (action === "terms") {
      navigate("/legal/terms");
      return;
    }
    if (action === "faq") {
      navigate("/faq");
    }
  };

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
        <HeaderUsersStretchMenu
          activeItemKey={stretchActiveItemKey}
          onItemAction={handleStretchItemAction}
        />
      </nav>
    );
  }

  return (
    <nav className={navClassName} aria-label={HOME_PAGE_UI.NAV_AUTH_ARIA}>
      <HeaderUsersButton
        isActive={isUsersNavActive}
        onClick={() => onSetMainView("users")}
      />
      {isAuthorized ? (
        <>
          <HeaderWishlistButton
            isActive={isWishlistNavActive}
            onClick={() => onSetMainView("wishlist")}
          />
          <HeaderNotificationsButton
            isActive={isNotificationsNavActive}
            unreadCount={unreadNotificationsCount}
            onClick={onNotificationsClick}
          />
        </>
      ) : null}
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
