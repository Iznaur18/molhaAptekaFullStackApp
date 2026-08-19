import { lazy, Suspense, useEffect, useRef } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { HeaderUsersStretchMenu } from "../../widgets/header-users-stretch-menu/ui/HeaderUsersStretchMenu.jsx";
import {
  HOME_PAGE_UI,
  PRODUCT_SEARCH_INPUT_UI,
} from "../../shared/config/appUiCopy.js";
import { getAppShellHeaderVariantClass } from "../lib/appShellVariant.js";
import { isProfileTabMainView } from "../../widgets/app-shell/lib/profileTabToMainView.js";
import {
  isCatalogBrowserMainView,
  isCatalogHeaderMainView,
} from "../../shared/lib/homeMainViewPaths.js";
import { MobileBottomNav } from "../../widgets/mobile-bottom-nav/ui/MobileBottomNav.jsx";
import { useScrollLock } from "../../shared/lib/useScrollLock.js";
import { useRegisterBlockingOverlay } from "../../shared/lib/useBlockingOverlayOccupancy.js";
import { SearchInput } from "../../shared/ui/SearchInput/SearchInput.jsx";
import { useSiteHeaderBannerSlidesQuery } from "../../entities/site-header-banner/model/useSiteHeaderBannerSlidesQuery.js";
import { ViewerRegionSelect } from "../../entities/region/ui/ViewerRegionSelect.jsx";
import {
  isFaqPath,
  parseLegalKindFromPathname,
} from "../../shared/lib/infoPagePaths.js";

const LazySiteHeaderBannerCarousel = lazy(() =>
  import("../../entities/site-header-banner/ui/SiteHeaderBannerCarousel.jsx").then(
    (module) => ({ default: module.SiteHeaderBannerCarousel }),
  ),
);
/**
 * Единый topbar для всех ширин веба (mobile chrome: search + region + stretch).
 *
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
 *   viewerRegionCode?: string;
 *   onViewerRegionChange?: (code: string) => void;
 * }} props
 */
export function AppShellHeader({
  mainView,
  isMineMode,
  selectedProductCategory: _selectedProductCategory,
  isProductCategoryListOpen,
  onCatalogMenuClick,
  isCatalogMenuActive = false,
  productSearchTerm,
  isProductSearchPending,
  isAuthorized,
  onSetMainView,
  onProductCategorySelect: _onProductCategorySelect,
  onProductCategoryFilterToggle: _onProductCategoryFilterToggle,
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
  pendingModerationCount: _pendingModerationCount = 0,
  pendingInstallmentDisputesCount: _pendingInstallmentDisputesCount = 0,
  pendingProductReportsCount: _pendingProductReportsCount = 0,
  pendingDataConfirmationCount: _pendingDataConfirmationCount = 0,
  showSiteHeaderBanner = false,
  isCatalogBrowserLanding = false,
  showHeaderPanel = true,
  viewerRegionCode = "",
  onViewerRegionChange,
}) {
  /** @type {import('react').RefObject<HTMLDivElement | null>} */
  const productCategoryFilterRef = useRef(null);
  const hideProductSearch = isCatalogBrowserLanding;

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
  useRegisterBlockingOverlay(isProductCategoryListOpen);

  const isCatalogHeaderView = isCatalogHeaderMainView(mainView);
  const isUsersNavActive = mainView === "users";
  const isCartNavActive = mainView === "cart";
  const isMyProfileNavActive = isProfileTabMainView(mainView);
  const isHomeNavActive = mainView === "catalog";
  const isCatalogNavActive =
    isCatalogBrowserMainView(mainView) || isCatalogMenuActive;

  const slidesQuery = useSiteHeaderBannerSlidesQuery({
    enabled: showSiteHeaderBanner,
    regionCode: viewerRegionCode,
  });
  const siteHeaderBannerSlides = showSiteHeaderBanner ? (slidesQuery.data ?? []) : [];

  const showViewerRegionPicker =
    Boolean(viewerRegionCode) &&
    typeof onViewerRegionChange === "function" &&
    isCatalogHeaderView &&
    !isMineMode;

  const hideHeaderPanel =
    !showHeaderPanel ||
    isProfileTabMainView(mainView) ||
    mainView === "cart" ||
    mainView === "catalog-browser";

  const headerClassName = [
    "app-shell__header",
    getAppShellHeaderVariantClass(),
    "app-shell__header--mobile-split",
    hideHeaderPanel && "app-shell__header--no-panel",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {showHeaderPanel ? (
        <header className={headerClassName}>
          {hideHeaderPanel ? null : (
            <div className="app-shell__header-panel">
              <div className="app-shell__header-top">
                <div className="app-shell__header-main">
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
                        showLeadingIcon
                      />
                    )}
                  </div>
                </div>
                <HeaderNavActions
                  isUsersNavActive={isUsersNavActive}
                  isNotificationsNavActive={mainView === "notifications"}
                  onSetMainView={onSetMainView}
                  onNotificationsClick={onNotificationsClick}
                  showViewerRegionPicker={showViewerRegionPicker}
                  viewerRegionCode={viewerRegionCode}
                  onViewerRegionChange={onViewerRegionChange}
                />
              </div>
            </div>
          )}
          {siteHeaderBannerSlides.length > 0 ? (
            <Suspense fallback={null}>
              <LazySiteHeaderBannerCarousel slides={siteHeaderBannerSlides} />
            </Suspense>
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
 * Topbar actions: region + stretch menu (единый chrome).
 * @param {{
 *   isUsersNavActive: boolean;
 *   isNotificationsNavActive?: boolean;
 *   onSetMainView: (view: import('../../shared/lib/homeMainViewPaths.js').HomeMainView) => void;
 *   onNotificationsClick: () => void;
 *   showViewerRegionPicker?: boolean;
 *   viewerRegionCode?: string;
 *   onViewerRegionChange?: (code: string) => void;
 * }} props
 */
function HeaderNavActions({
  isUsersNavActive,
  isNotificationsNavActive = false,
  onSetMainView,
  onNotificationsClick,
  showViewerRegionPicker = false,
  viewerRegionCode = "",
  onViewerRegionChange,
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
        : isNotificationsNavActive
          ? "notifications"
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
      return;
    }
    if (action === "notifications") {
      onNotificationsClick();
    }
  };

  return (
    <nav
      className="app-shell__auth-actions app-shell__auth-actions--mobile-top"
      aria-label={HOME_PAGE_UI.NAV_AUTH_ARIA}
    >
      {showViewerRegionPicker && typeof onViewerRegionChange === "function" ? (
        <ViewerRegionSelect
          className="app-shell__viewer-region"
          value={viewerRegionCode}
          onChange={onViewerRegionChange}
        />
      ) : null}
      <HeaderUsersStretchMenu
        variant="cta"
        activeItemKey={stretchActiveItemKey}
        onItemAction={handleStretchItemAction}
      />
    </nav>
  );
}
