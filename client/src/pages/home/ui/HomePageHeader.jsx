import { useEffect, useRef } from "react";

import { formatSellerProductsQuota } from "../../../entities/product/lib/sellerProductsLimit.js";
import {
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_OPTIONS_MY_PRODUCTS,
  MY_PRODUCTS_MODERATION_FILTER_OPTIONS,
  MY_PRODUCTS_MODERATION_FILTER_LABEL_RU,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { CatalogCategoryFilterButton } from "../../../widgets/catalog-category-filter-button/ui/CatalogCategoryFilterButton.jsx";
import { CatalogFilterDropdown } from "../../../widgets/catalog-filter-dropdown/ui/CatalogFilterDropdown.jsx";
import { HeaderCartButton } from "../../../widgets/header-cart-button/ui/HeaderCartButton.jsx";
import { HeaderNotificationsButton } from "../../../widgets/header-notifications-button/ui/HeaderNotificationsButton.jsx";
import { HeaderPlaceProductButton } from "../../../widgets/header-place-product-button/ui/HeaderPlaceProductButton.jsx";
import { HeaderProfileButton } from "../../../widgets/header-profile-button/ui/HeaderProfileButton.jsx";
import { HeaderUsersButton } from "../../../widgets/header-users-button/ui/HeaderUsersButton.jsx";
import {
  DATA_CONFIRMATION_PAGE_UI,
  HOME_PAGE_UI,
  PRODUCT_MODERATION_PAGE_UI,
  PRODUCT_REPORTS_PAGE_UI,
  PRODUCT_SEARCH_INPUT_UI,
} from "../../../shared/config/appUiCopy.js";
import { getHomeHeaderVariantClass } from "../lib/homeHeaderVariant.js";
import { isCatalogShellMainView } from "../../../shared/lib/homeMainViewPaths.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

const PRODUCT_CATEGORY_FILTER_LIST_ID =
  HOME_PAGE_UI.PRODUCT_CATEGORY_FILTER_LIST_ID;

/** Разделы с подписью в кнопках шапки — без дублирующего view-title. */
const HEADER_VIEW_TITLE_HIDDEN_VIEWS = new Set(["users", "cart"]);

const NON_CATALOG_VIEW_TITLES = {
  "my-profile": HOME_PAGE_UI.AUTH_MY_PROFILE,
  users: HOME_PAGE_UI.TITLE_USERS,
  subscriptions: HOME_PAGE_UI.TITLE_SUBSCRIPTIONS,
  cart: HOME_PAGE_UI.TITLE_CART,
  "my-sales": HOME_PAGE_UI.TITLE_MY_SALES,
  "my-orders": HOME_PAGE_UI.TITLE_MY_ORDERS,
  "admin-orders": HOME_PAGE_UI.TITLE_ADMIN_ORDERS,
  "product-moderation": HOME_PAGE_UI.TITLE_PRODUCT_MODERATION,
  "product-reports": HOME_PAGE_UI.TITLE_PRODUCT_REPORTS,
  "data-confirmation-requests": HOME_PAGE_UI.TITLE_DATA_CONFIRMATION,
  notifications: HOME_PAGE_UI.TITLE_NOTIFICATIONS,
};

/**
 * @param {{
 *   mainView: import('./HomePage.jsx').HomeMainView;
 *   isMineMode: boolean;
 *   selectedProductCategory: import('../../../entities/product/model/types.js').ProductCategory | null;
 *   isProductCategoryListOpen: boolean;
 *   productSearchTerm: string;
 *   isProductSearchPending: boolean;
 *   isAuthorized: boolean;
 *   onSetMainView: (view: import('./HomePage.jsx').HomeMainView) => void;
 *   onProductCategorySelect: (category: import('../../../entities/product/model/types.js').ProductCategory | null) => void;
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
 *   catalogSort: string;
 *   onCatalogSortChange: (value: string) => void;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogSaleOnly: boolean;
 *   onCatalogFollowingOnlyToggle: () => void;
 *   onCatalogAuctionOnlyToggle: () => void;
 *   onCatalogSaleOnlyToggle: () => void;
 *   isAdmin: boolean;
 *   showHiddenCatalogProducts: boolean;
 *   onShowHiddenCatalogProductsChange: (next: boolean) => void;
 *   myProductsTotal: number | null;
 *   sellerProductsLimit: number | null;
 *   pendingModerationCount?: number;
 *   pendingProductReportsCount?: number;
 *   pendingDataConfirmationCount?: number;
 *   myProductsModerationFilter?: string;
 *   onMyProductsModerationFilterChange?: (value: string) => void;
 * }} props
 */
export function HomePageHeader({
  mainView,
  isMineMode,
  selectedProductCategory,
  isProductCategoryListOpen,
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
  catalogSort,
  onCatalogSortChange,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogSaleOnly,
  onCatalogFollowingOnlyToggle,
  onCatalogAuctionOnlyToggle,
  onCatalogSaleOnlyToggle,
  isAdmin,
  showHiddenCatalogProducts,
  onShowHiddenCatalogProductsChange,
  myProductsTotal,
  sellerProductsLimit,
  pendingModerationCount = 0,
  pendingProductReportsCount = 0,
  pendingDataConfirmationCount = 0,
  myProductsModerationFilter = "",
  onMyProductsModerationFilterChange,
}) {
  /** @type {import('react').RefObject<HTMLDivElement | null>} */
  const productCategoryFilterRef = useRef(null);

  useEffect(() => {
    if (!isProductCategoryListOpen) return undefined;

    const handlePointerDown = (event) => {
      const root = productCategoryFilterRef.current;
      if (
        root &&
        event.target instanceof Node &&
        !root.contains(event.target)
      ) {
        onCloseProductCategoryFilter();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isProductCategoryListOpen, onCloseProductCategoryFilter]);

  useScrollLock(isProductCategoryListOpen);

  const isCatalogView = isCatalogShellMainView(mainView);
  const isUsersNavActive = mainView === "users";
  const isCartNavActive = mainView === "cart";
  const isMyProfileNavActive = mainView === "my-profile";
  const isNotificationsNavActive = mainView === "notifications";

  const nonCatalogTitle = (() => {
    const base = NON_CATALOG_VIEW_TITLES[mainView] ?? "";
    if (
      mainView === "product-moderation" &&
      pendingModerationCount > 0
    ) {
      return `${base} (${PRODUCT_MODERATION_PAGE_UI.TAB_BADGE(pendingModerationCount)})`;
    }
    if (
      mainView === "product-reports" &&
      pendingProductReportsCount > 0
    ) {
      return `${base} (${PRODUCT_REPORTS_PAGE_UI.TAB_BADGE(pendingProductReportsCount)})`;
    }
    if (
      mainView === "data-confirmation-requests" &&
      pendingDataConfirmationCount > 0
    ) {
      return `${base} (${DATA_CONFIRMATION_PAGE_UI.TAB_BADGE(pendingDataConfirmationCount)})`;
    }
    return base;
  })();

  const headerViewTitle = HEADER_VIEW_TITLE_HIDDEN_VIEWS.has(mainView)
    ? ""
    : nonCatalogTitle;

  const headerClassName = ["home-page__header", getHomeHeaderVariantClass()]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName}>
      <div className="home-page__header-top">
        <div className="home-page__header-main">
          <HomeHeaderTitleRow
            isCatalogView={isCatalogView}
            isMineMode={isMineMode}
            headerViewTitle={headerViewTitle}
            onNavigateToFullCatalogFromBreadcrumb={
              onNavigateToFullCatalogFromBreadcrumb
            }
          />
          {isCatalogView ? (
            <>
              <div
                className="home-page__header-filter"
                ref={productCategoryFilterRef}
              >
                <CatalogCategoryFilterButton
                  isOpen={isProductCategoryListOpen}
                  selectedProductCategory={selectedProductCategory}
                  listId={PRODUCT_CATEGORY_FILTER_LIST_ID}
                  onClick={onProductCategoryFilterToggle}
                  mode={isMineMode ? "category" : "catalog"}
                  isFilterActive={
                    !isMineMode &&
                    (selectedProductCategory != null ||
                      catalogFollowingOnly ||
                      catalogAuctionOnly ||
                      catalogSaleOnly ||
                      catalogSort !== CATALOG_SORT_NEWEST)
                  }
                />
                {isProductCategoryListOpen && !isMineMode ? (
                  <CatalogFilterDropdown
                    panelId={PRODUCT_CATEGORY_FILTER_LIST_ID}
                    selectedProductCategory={selectedProductCategory}
                    catalogSort={catalogSort}
                    catalogFollowingOnly={catalogFollowingOnly}
                    catalogAuctionOnly={catalogAuctionOnly}
                    catalogSaleOnly={catalogSaleOnly}
                    onProductCategorySelect={onProductCategorySelect}
                    onCatalogSortChange={onCatalogSortChange}
                    onCatalogFollowingOnlyToggle={onCatalogFollowingOnlyToggle}
                    onCatalogAuctionOnlyToggle={onCatalogAuctionOnlyToggle}
                    onCatalogSaleOnlyToggle={onCatalogSaleOnlyToggle}
                  />
                ) : null}
                {isProductCategoryListOpen && isMineMode ? (
                  <ul
                    id={PRODUCT_CATEGORY_FILTER_LIST_ID}
                    className="home-page__category-list"
                    role="list"
                    onWheel={(event) => event.stopPropagation()}
                  >
                    <li className="home-page__category-item">
                      <button
                        type="button"
                        className="home-page__category-option"
                        onClick={() => onProductCategorySelect(null)}
                      >
                        {HOME_PAGE_UI.CATEGORY_ALL}
                      </button>
                    </li>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <li key={category} className="home-page__category-item">
                        <button
                          type="button"
                          className="home-page__category-option"
                          onClick={() => onProductCategorySelect(category)}
                        >
                          {PRODUCT_CATEGORY_LABEL_RU[category]}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="home-page__header-search">
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
            </>
          ) : null}
        </div>
        <nav
          className="home-page__auth-actions"
          aria-label={HOME_PAGE_UI.NAV_AUTH_ARIA}
        >
          <HeaderUsersButton
            isActive={isUsersNavActive}
            onClick={() => onSetMainView("users")}
          />
          <HeaderCartButton
            isActive={isCartNavActive}
            onClick={() => onSetMainView("cart")}
          />
          <HeaderPlaceProductButton
            isLoginRequired={!isAuthorized}
            onClick={() =>
              isAuthorized ? onPlaceProductClick() : onLoginClick()
            }
          />
          {isAuthorized ? (
            <>
              <HeaderProfileButton
                isActive={isMyProfileNavActive}
                onClick={onMyProfileClick}
              />
              <HeaderNotificationsButton
                isActive={isNotificationsNavActive}
                unreadCount={unreadNotificationsCount}
                onClick={onNotificationsClick}
              />
            </>
          ) : (
            <>
              <button
                type="button"
                className="home-page__auth-button home-page__auth-button_secondary"
                onClick={onLoginClick}
              >
                {HOME_PAGE_UI.AUTH_LOGIN}
              </button>
              <button
                type="button"
                className="home-page__auth-button"
                onClick={onRegisterClick}
              >
                {HOME_PAGE_UI.AUTH_REGISTER}
              </button>
            </>
          )}
        </nav>
      </div>
      {isCatalogView ? (
        <CatalogToolbar
          isMineMode={isMineMode}
          onPlaceProductClick={onPlaceProductClick}
          catalogSort={catalogSort}
          onCatalogSortChange={onCatalogSortChange}
          isAdmin={isAdmin}
          showHiddenCatalogProducts={showHiddenCatalogProducts}
          onShowHiddenCatalogProductsChange={
            onShowHiddenCatalogProductsChange
          }
          myProductsTotal={myProductsTotal}
          sellerProductsLimit={sellerProductsLimit}
          myProductsModerationFilter={myProductsModerationFilter}
          onMyProductsModerationFilterChange={
            onMyProductsModerationFilterChange
          }
        />
      ) : null}
    </header>
  );
}

/**
 * @param {{
 *   isCatalogView: boolean;
 *   isMineMode: boolean;
 *   headerViewTitle: string;
 *   onNavigateToFullCatalogFromBreadcrumb: () => void;
 * }} props
 */
function HomeHeaderTitleRow({
  isCatalogView,
  isMineMode,
  headerViewTitle,
  onNavigateToFullCatalogFromBreadcrumb,
}) {
  return (
    <div className="home-page__title-row">
      <h1 className="home-page__title home-page__title_inline">
        <button
          type="button"
          className="home-page__brand-button"
          onClick={onNavigateToFullCatalogFromBreadcrumb}
          aria-label={HOME_PAGE_UI.NAV_TO_HOME}
        >
          <img
            className="home-page__logo"
            src={HOME_PAGE_UI.LOGO_SRC}
            alt={HOME_PAGE_UI.LOGO_ALT}
            width={120}
            height={40}
            decoding="async"
          />
        </button>
      </h1>
      {isCatalogView && isMineMode ? (
        <span
          className="home-page__breadcrumb"
          aria-label={HOME_PAGE_UI.ARIA_MY_PRODUCTS_CRUMB}
        >
          <span className="home-page__breadcrumb-text">
            {HOME_PAGE_UI.BREADCRUMB_MY_PROFILE}
          </span>
          <span className="home-page__breadcrumb-sep" aria-hidden="true">
            {HOME_PAGE_UI.BREADCRUMB_SEPARATOR}
          </span>
          <span className="home-page__breadcrumb-text">
            {HOME_PAGE_UI.BREADCRUMB_MY_PRODUCTS}
          </span>
        </span>
      ) : null}
      {!isCatalogView && headerViewTitle ? (
        <span className="home-page__view-title">{headerViewTitle}</span>
      ) : null}
    </div>
  );
}

function CatalogToolbar({
  isMineMode,
  onPlaceProductClick,
  catalogSort,
  onCatalogSortChange,
  isAdmin,
  showHiddenCatalogProducts,
  onShowHiddenCatalogProductsChange,
  myProductsTotal,
  sellerProductsLimit,
  myProductsModerationFilter = "",
  onMyProductsModerationFilterChange,
}) {
  const showAdminHiddenToggle = isAdmin && !isMineMode;
  const showProductsQuota =
    isMineMode && sellerProductsLimit != null && !isAdmin;
  const productsQuotaText =
    showProductsQuota && sellerProductsLimit != null
      ? formatSellerProductsQuota(myProductsTotal, sellerProductsLimit)
      : null;
  const showCatalogFiltersRow = isMineMode || showAdminHiddenToggle;

  return (
    <>
      {showCatalogFiltersRow ? (
      <div className="home-page__catalog-filters-row">
        {isMineMode ? (
          <>
            <div className="home-page__sort">
              <label className="home-page__sort-label">
                <span>{HOME_PAGE_UI.SORT_LABEL}</span>
                <select
                  className="home-page__sort-control"
                  value={catalogSort}
                  onChange={(event) =>
                    onCatalogSortChange(event.target.value)
                  }
                >
                  {CATALOG_SORT_OPTIONS_MY_PRODUCTS.map((optionKey) => (
                    <option key={optionKey} value={optionKey}>
                      {CATALOG_SORT_LABEL_RU[optionKey]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {typeof onMyProductsModerationFilterChange === "function" ? (
              <div className="home-page__sort">
                <label className="home-page__sort-label">
                  <span>{HOME_PAGE_UI.MODERATION_STATUS_FILTER_LABEL}</span>
                  <select
                    className="home-page__sort-control"
                    value={myProductsModerationFilter}
                    onChange={(event) =>
                      onMyProductsModerationFilterChange(event.target.value)
                    }
                  >
                    {MY_PRODUCTS_MODERATION_FILTER_OPTIONS.map((filterKey) => (
                      <option key={filterKey || "all"} value={filterKey}>
                        {MY_PRODUCTS_MODERATION_FILTER_LABEL_RU[filterKey]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
          </>
        ) : null}
        {showAdminHiddenToggle ? (
          <label className="home-page__hidden-toggle">
            <input
              type="checkbox"
              checked={showHiddenCatalogProducts}
              onChange={(event) =>
                onShowHiddenCatalogProductsChange(event.target.checked)
              }
            />
            <span>{HOME_PAGE_UI.SHOW_HIDDEN_PRODUCTS}</span>
          </label>
        ) : null}
      </div>
      ) : null}

      {isMineMode ? (
        <div className="home-page__my-products-subtitle-row">
          <button
            type="button"
            className="home-page__create-product-button"
            onClick={onPlaceProductClick}
          >
            {HOME_PAGE_UI.LIST_PRODUCT_BUTTON}
          </button>
          {productsQuotaText ? (
            <p
              className="home-page__my-products-quota"
              aria-label={`${HOME_PAGE_UI.MY_PRODUCTS_QUOTA_LABEL}: ${productsQuotaText}`}
            >
              <span className="home-page__my-products-quota-label">
                {HOME_PAGE_UI.MY_PRODUCTS_QUOTA_LABEL}:
              </span>{" "}
              <span className="home-page__my-products-quota-value">
                {productsQuotaText}
              </span>
            </p>
          ) : null}
          <p className="home-page__subtitle">{HOME_PAGE_UI.SUBTITLE_MY_ONLY}</p>
        </div>
      ) : null}
    </>
  );
}
