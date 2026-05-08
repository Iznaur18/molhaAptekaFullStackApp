import { useEffect, useRef } from "react";

import {
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
 *   onCreateProductClick: () => void;
 *   onMyProfileClick: () => void;
 *   onLoginClick: () => void;
 *   onRegisterClick: () => void;
 *   onNavigateToFullCatalogFromBreadcrumb: () => void;
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
  onCreateProductClick,
  onMyProfileClick,
  onLoginClick,
  onRegisterClick,
  onNavigateToFullCatalogFromBreadcrumb,
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
            onCreateProductClick={onCreateProductClick}
            onNavigateToFullCatalogFromBreadcrumb={
              onNavigateToFullCatalogFromBreadcrumb
            }
          />
        )}
      </div>
      <div className="home-page__auth-actions">
        <HeaderCartButton onClick={() => onSetMainView("cart")} />
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
  onCreateProductClick,
  onNavigateToFullCatalogFromBreadcrumb,
}) {
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
            onClick={onCreateProductClick}
          >
            {HOME_PAGE_UI.CREATE_PRODUCT_BUTTON}
          </button>
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
