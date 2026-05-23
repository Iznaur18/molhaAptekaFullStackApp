import { useEffect, useRef } from "react";

import { formatSellerProductsQuota } from "../../../entities/product/lib/sellerProductsLimit.js";
import {
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_OPTIONS,
  CATALOG_SORT_OPTIONS_MY_PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { HeaderCartButton } from "../../../widgets/header-cart-button/ui/HeaderCartButton.jsx";
import {
  HOME_PAGE_UI,
  PRODUCT_SEARCH_INPUT_UI,
} from "../../../shared/config/appUiCopy.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";

const PRODUCT_CATEGORY_FILTER_LIST_ID =
  HOME_PAGE_UI.PRODUCT_CATEGORY_FILTER_LIST_ID;

const NON_CATALOG_VIEW_TITLES = {
  users: HOME_PAGE_UI.TITLE_USERS,
  cart: HOME_PAGE_UI.TITLE_CART,
  "my-sales": HOME_PAGE_UI.TITLE_MY_SALES,
  "my-orders": HOME_PAGE_UI.TITLE_MY_ORDERS,
  "admin-orders": HOME_PAGE_UI.TITLE_ADMIN_ORDERS,
  "product-moderation": HOME_PAGE_UI.TITLE_PRODUCT_MODERATION,
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
 *   onLoginClick: () => void;
 *   onRegisterClick: () => void;
 *   onNavigateToFullCatalogFromBreadcrumb: () => void;
 *   catalogSort: string;
 *   onCatalogSortChange: (sort: string) => void;
 *   isAdmin: boolean;
 *   showHiddenCatalogProducts: boolean;
 *   onShowHiddenCatalogProductsChange: (next: boolean) => void;
 *   myProductsTotal: number | null;
 *   sellerProductsLimit: number | null;
 *   isPlaceProductDisabled: boolean;
 *   placeProductDisabledTitle: string;
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
  onLoginClick,
  onRegisterClick,
  onNavigateToFullCatalogFromBreadcrumb,
  catalogSort,
  onCatalogSortChange,
  isAdmin,
  showHiddenCatalogProducts,
  onShowHiddenCatalogProductsChange,
  myProductsTotal,
  sellerProductsLimit,
  isPlaceProductDisabled,
  placeProductDisabledTitle,
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

  const isCatalogView = mainView === "catalog";

  return (
    <header className="home-page__header">
      <div>
        {!isCatalogView ? (
          <div className="home-page__title-row">
            <button
              type="button"
              className="home-page__title-nav"
              onClick={() => onSetMainView("catalog")}
            >
              {HOME_PAGE_UI.NAV_TO_CATALOG}
            </button>
            <h1 className="home-page__title home-page__title_inline">
              {NON_CATALOG_VIEW_TITLES[mainView]}
            </h1>
          </div>
        ) : (
          <CatalogTitleAndFilters
            isMineMode={isMineMode}
            selectedProductCategory={selectedProductCategory}
            isProductCategoryListOpen={isProductCategoryListOpen}
            productSearchTerm={productSearchTerm}
            isProductSearchPending={isProductSearchPending}
            productCategoryFilterRef={productCategoryFilterRef}
            onSetMainView={onSetMainView}
            onProductCategorySelect={onProductCategorySelect}
            onProductCategoryFilterToggle={onProductCategoryFilterToggle}
            onProductSearchTermChange={onProductSearchTermChange}
            onPlaceProductClick={onPlaceProductClick}
            onNavigateToFullCatalogFromBreadcrumb={
              onNavigateToFullCatalogFromBreadcrumb
            }
            catalogSort={catalogSort}
            onCatalogSortChange={onCatalogSortChange}
            isAdmin={isAdmin}
            showHiddenCatalogProducts={showHiddenCatalogProducts}
            onShowHiddenCatalogProductsChange={
              onShowHiddenCatalogProductsChange
            }
            myProductsTotal={myProductsTotal}
            sellerProductsLimit={sellerProductsLimit}
            isPlaceProductDisabled={isPlaceProductDisabled}
            placeProductDisabledTitle={placeProductDisabledTitle}
          />
        )}
      </div>
      <div className="home-page__auth-actions">
        <HeaderCartButton onClick={() => onSetMainView("cart")} />
        <button
          type="button"
          className="home-page__list-product-button"
          disabled={isAuthorized && isPlaceProductDisabled}
          title={
            isAuthorized && isPlaceProductDisabled
              ? placeProductDisabledTitle
              : undefined
          }
          onClick={() =>
            isAuthorized ? onPlaceProductClick() : onLoginClick()
          }
        >
          {isAuthorized
            ? HOME_PAGE_UI.LIST_PRODUCT_BUTTON
            : HOME_PAGE_UI.LOGIN_TO_LIST_PRODUCT}
        </button>
        {isAuthorized ? (
          <button
            type="button"
            className="home-page__auth-button home-page__auth-button_secondary"
            onClick={onMyProfileClick}
          >
            {HOME_PAGE_UI.AUTH_MY_PROFILE}
          </button>
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
      </div>
    </header>
  );
}

function CatalogTitleAndFilters({
  isMineMode,
  selectedProductCategory,
  isProductCategoryListOpen,
  productSearchTerm,
  isProductSearchPending,
  productCategoryFilterRef,
  onSetMainView,
  onProductCategorySelect,
  onProductCategoryFilterToggle,
  onProductSearchTermChange,
  onPlaceProductClick,
  onNavigateToFullCatalogFromBreadcrumb,
  catalogSort,
  onCatalogSortChange,
  isAdmin,
  showHiddenCatalogProducts,
  onShowHiddenCatalogProductsChange,
  myProductsTotal,
  sellerProductsLimit,
  isPlaceProductDisabled,
  placeProductDisabledTitle,
}) {
  const showAdminHiddenToggle = isAdmin && !isMineMode;
  const showProductsQuota =
    isMineMode && sellerProductsLimit != null && !isAdmin;
  const productsQuotaText =
    showProductsQuota && sellerProductsLimit != null
      ? formatSellerProductsQuota(myProductsTotal, sellerProductsLimit)
      : null;
  const catalogSortOptions = isMineMode
    ? CATALOG_SORT_OPTIONS_MY_PRODUCTS
    : CATALOG_SORT_OPTIONS;

  return (
    <>
      <div className="home-page__title-row">
        <h1
          className="home-page__title home-page__title_inline"
          aria-label={
            isMineMode ? HOME_PAGE_UI.ARIA_MY_PRODUCTS_CRUMB : undefined
          }
        >
          {isMineMode ? (
            <span className="home-page__breadcrumb">
              <button
                type="button"
                className="home-page__breadcrumb-link"
                onClick={onNavigateToFullCatalogFromBreadcrumb}
              >
                {HOME_PAGE_UI.BREADCRUMB_HOME}
              </button>
              <span className="home-page__breadcrumb-sep" aria-hidden="true">
                {HOME_PAGE_UI.BREADCRUMB_SEPARATOR}
              </span>
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
          ) : (
            HOME_PAGE_UI.TITLE_CATALOG
          )}
        </h1>
        {!isMineMode ? (
          <button
            type="button"
            className="home-page__title-nav"
            onClick={() => onSetMainView("users")}
          >
            {HOME_PAGE_UI.NAV_TO_USERS}
          </button>
        ) : null}
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

      <div className="home-page__catalog-filters-row">
        <div className="home-page__sort">
        <label className="home-page__sort-label">
          <span>{HOME_PAGE_UI.SORT_LABEL}</span>
          <select
            className="home-page__sort-control"
            value={catalogSort}
            onChange={(event) => onCatalogSortChange(event.target.value)}
          >
            {catalogSortOptions.map((sortKey) => (
              <option key={sortKey} value={sortKey}>
                {CATALOG_SORT_LABEL_RU[sortKey]}
              </option>
            ))}
          </select>
          </label>
        </div>
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

      <div className="home-page__search-row">
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

      {isMineMode ? (
        <div className="home-page__my-products-subtitle-row">
          <button
            type="button"
            className="home-page__create-product-button"
            disabled={isPlaceProductDisabled}
            title={isPlaceProductDisabled ? placeProductDisabledTitle : undefined}
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
      ) : (
        <p className="home-page__subtitle">
          {HOME_PAGE_UI.SUBTITLE_ALL_PRODUCTS}
        </p>
      )}
    </>
  );
}
