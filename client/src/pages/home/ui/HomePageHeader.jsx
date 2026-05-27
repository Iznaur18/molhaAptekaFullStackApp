import { useEffect, useRef } from "react";

import { formatSellerProductsQuota } from "../../../entities/product/lib/sellerProductsLimit.js";
import {
  CATALOG_SELECT_OPTIONS,
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_OPTIONS_MY_PRODUCTS,
  MY_PRODUCTS_MODERATION_FILTER_OPTIONS,
  MY_PRODUCTS_MODERATION_FILTER_LABEL_RU,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { HeaderCartButton } from "../../../widgets/header-cart-button/ui/HeaderCartButton.jsx";
import { HeaderNotificationsButton } from "../../../widgets/header-notifications-button/ui/HeaderNotificationsButton.jsx";
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

const PRODUCT_CATEGORY_FILTER_LIST_ID =
  HOME_PAGE_UI.PRODUCT_CATEGORY_FILTER_LIST_ID;

/**
 * @param {boolean} isActive
 */
function headerNavButtonClassName(isActive) {
  return [
    "home-page__list-product-button",
    isActive && "home-page__header-nav-button--active",
  ]
    .filter(Boolean)
    .join(" ");
}

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
 *   catalogSelectValue: string;
 *   onCatalogSelectChange: (value: string) => void;
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
  catalogSelectValue,
  onCatalogSelectChange,
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

  useEffect(() => {
    if (!isProductCategoryListOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isProductCategoryListOpen]);

  const isCatalogView = isCatalogShellMainView(mainView);
  const isHomeNavActive = mainView === "catalog";
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
            isHomeNavActive={isHomeNavActive}
            isUsersNavActive={isUsersNavActive}
            isMineMode={isMineMode}
            headerViewTitle={headerViewTitle}
            onSetMainView={onSetMainView}
            onNavigateToFullCatalogFromBreadcrumb={
              onNavigateToFullCatalogFromBreadcrumb
            }
          />
        </div>
        <nav
          className="home-page__auth-actions"
          aria-label={HOME_PAGE_UI.NAV_AUTH_ARIA}
        >
          <HeaderCartButton
            isActive={isCartNavActive}
            onClick={() => onSetMainView("cart")}
          />
          <button
            type="button"
            className="home-page__list-product-button"
            onClick={() =>
              isAuthorized ? onPlaceProductClick() : onLoginClick()
            }
          >
            {isAuthorized
              ? HOME_PAGE_UI.LIST_PRODUCT_BUTTON
              : HOME_PAGE_UI.LOGIN_TO_LIST_PRODUCT}
          </button>
          {isAuthorized ? (
            <>
              <button
                type="button"
                className={[
                  "home-page__auth-button",
                  "home-page__auth-button_secondary",
                  isMyProfileNavActive ? "home-page__header-nav-button--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={onMyProfileClick}
                aria-current={isMyProfileNavActive ? "page" : undefined}
              >
                {HOME_PAGE_UI.AUTH_MY_PROFILE}
              </button>
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
          selectedProductCategory={selectedProductCategory}
          isProductCategoryListOpen={isProductCategoryListOpen}
          productSearchTerm={productSearchTerm}
          isProductSearchPending={isProductSearchPending}
          productCategoryFilterRef={productCategoryFilterRef}
          onProductCategorySelect={onProductCategorySelect}
          onProductCategoryFilterToggle={onProductCategoryFilterToggle}
          onProductSearchTermChange={onProductSearchTermChange}
          onPlaceProductClick={onPlaceProductClick}
          catalogSelectValue={catalogSelectValue}
          onCatalogSelectChange={onCatalogSelectChange}
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
 *   isHomeNavActive: boolean;
 *   isUsersNavActive: boolean;
 *   showUsersNav: boolean;
 *   onHomeClick: () => void;
 *   onUsersClick: () => void;
 * }} props
 */
function HomeSectionNav({
  isHomeNavActive,
  isUsersNavActive,
  showUsersNav,
  onHomeClick,
  onUsersClick,
}) {
  return (
    <nav
      className="home-page__auth-actions"
      aria-label={HOME_PAGE_UI.NAV_SECTIONS_ARIA}
    >
      <button
        type="button"
        className={headerNavButtonClassName(isHomeNavActive)}
        onClick={onHomeClick}
        aria-current={isHomeNavActive ? "page" : undefined}
      >
        {HOME_PAGE_UI.NAV_TO_HOME}
      </button>
      {showUsersNav ? (
        <button
          type="button"
          className={headerNavButtonClassName(isUsersNavActive)}
          onClick={onUsersClick}
          aria-current={isUsersNavActive ? "page" : undefined}
        >
          {HOME_PAGE_UI.NAV_TO_USERS}
        </button>
      ) : null}
    </nav>
  );
}

/**
 * @param {{
 *   isCatalogView: boolean;
 *   isHomeNavActive: boolean;
 *   isUsersNavActive: boolean;
 *   isMineMode: boolean;
 *   headerViewTitle: string;
 *   onSetMainView: (view: import('./HomePage.jsx').HomeMainView) => void;
 *   onNavigateToFullCatalogFromBreadcrumb: () => void;
 * }} props
 */
function HomeHeaderTitleRow({
  isCatalogView,
  isHomeNavActive,
  isUsersNavActive,
  isMineMode,
  headerViewTitle,
  onSetMainView,
  onNavigateToFullCatalogFromBreadcrumb,
}) {
  const showUsersNav = !isMineMode;

  return (
    <div className="home-page__title-row">
      <h1 className="home-page__title home-page__title_inline">
        {HOME_PAGE_UI.TITLE_CATALOG}
      </h1>
      <HomeSectionNav
        isHomeNavActive={isHomeNavActive}
        isUsersNavActive={isUsersNavActive}
        showUsersNav={showUsersNav}
        onHomeClick={onNavigateToFullCatalogFromBreadcrumb}
        onUsersClick={() => onSetMainView("users")}
      />
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
  selectedProductCategory,
  isProductCategoryListOpen,
  productSearchTerm,
  isProductSearchPending,
  productCategoryFilterRef,
  onProductCategorySelect,
  onProductCategoryFilterToggle,
  onProductSearchTermChange,
  onPlaceProductClick,
  catalogSelectValue,
  onCatalogSelectChange,
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
  const catalogSelectOptions = isMineMode
    ? CATALOG_SORT_OPTIONS_MY_PRODUCTS
    : CATALOG_SELECT_OPTIONS;

  return (
    <>
      <div className="home-page__catalog-filters-row">
        <div className="home-page__catalog-search">
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
        <div className="home-page__filter" ref={productCategoryFilterRef}>
          <button
            type="button"
            className="home-page__filter-button"
            aria-expanded={isProductCategoryListOpen}
            aria-controls={PRODUCT_CATEGORY_FILTER_LIST_ID}
            onClick={onProductCategoryFilterToggle}
          >
            {HOME_PAGE_UI.FILTER_BUTTON}
            {selectedProductCategory
              ? `: ${PRODUCT_CATEGORY_LABEL_RU[selectedProductCategory]}`
              : ""}
          </button>
          {isProductCategoryListOpen ? (
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
        <div className="home-page__sort">
        <label className="home-page__sort-label">
          <span>{HOME_PAGE_UI.SORT_LABEL}</span>
          <select
            className="home-page__sort-control"
            value={catalogSelectValue}
            onChange={(event) => onCatalogSelectChange(event.target.value)}
          >
            {catalogSelectOptions.map((optionKey) => (
              <option key={optionKey} value={optionKey}>
                {CATALOG_SORT_LABEL_RU[optionKey]}
              </option>
            ))}
          </select>
          </label>
        </div>
        {isMineMode && typeof onMyProductsModerationFilterChange === "function" ? (
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
