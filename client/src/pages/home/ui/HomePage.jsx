import { useEffect, useMemo, useRef, useState } from "react";

import { fetchAllProducts } from "../../../entities/product/api/fetchAllProducts.js";
import { fetchMyProducts } from "../../../entities/product/api/fetchMyProducts.js";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { ProductCard } from "../../../entities/product/ui/ProductCard.jsx";
import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import { fetchUserProfileById } from "../../../entities/user/api/fetchUserProfileById.js";
import { LoginModal } from "../../../entities/user/ui/LoginModal.jsx";
import { RegisterModal } from "../../../entities/user/ui/RegisterModal.jsx";
import { MyProfileModal } from "../../../entities/user/ui/MyProfileModal.jsx";
import { UserDetailsModal } from "../../../entities/user/ui/UserDetailsModal.jsx";
import { UsersPage } from "../../users/ui/UsersPage.jsx";
import { AUTH_TOKEN_STORAGE_KEY } from "../../../shared/api/index.js";
import {
  API_CLIENT_UI,
  HOME_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./HomePage.css";

/** @typedef {import('../../../entities/product/model/types.js').ProductCategory} ProductCategory */
/** @typedef {{ open: boolean; phase: 'idle'|'loading'|'success'|'error'; user: import('../../../entities/user/model/types.js').UserPublicProfile | null; error: string }} SellerModalState */
/** @typedef {{ open: boolean; phase: 'idle'|'loading'|'success'|'error'; user: import('../../../entities/user/model/types.js').UserPublicProfile | null; error: string }} MyProfileModalState */

const PRODUCT_CATEGORY_FILTER_LIST_ID =
  HOME_PAGE_UI.PRODUCT_CATEGORY_FILTER_LIST_ID;

/** @typedef {'catalog' | 'users'} HomeMainView */

export function HomePage() {
  /** @type {[HomeMainView, import('react').Dispatch<import('react').SetStateAction<HomeMainView>>]} */
  const [mainView, setMainView] = useState("catalog");
  const [products, setProducts] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(() => {
    try {
      return Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    } catch {
      return false;
    }
  });
  const [status, setStatus] = useState({ kind: "loading" });
  /** @type {import('react').MutableRefObject<number>} */
  const sellerFetchSeq = useRef(0);
  /** @type {[SellerModalState, import('react').Dispatch<import('react').SetStateAction<SellerModalState>>]} */
  const [sellerModal, setSellerModal] = useState(() => ({
    open: false,
    phase: "idle",
    user: null,
    error: "",
  }));
  /** @type {[MyProfileModalState, import('react').Dispatch<import('react').SetStateAction<MyProfileModalState>>]} */
  const [myProfileModal, setMyProfileModal] = useState(() => ({
    open: false,
    phase: "idle",
    user: null,
    error: "",
  }));
  const [isProductCategoryListOpen, setIsProductCategoryListOpen] =
    useState(false);
  /** @type {[ProductCategory | null, import('react').Dispatch<import('react').SetStateAction<ProductCategory | null>>]} */
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);
  /** @type {[import('../../../entities/product/model/types.js').ProductFromApi[] | null, import('react').Dispatch<import('react').SetStateAction<import('../../../entities/product/model/types.js').ProductFromApi[] | null>>]} */
  const [onlyMyProductsCatalog, setOnlyMyProductsCatalog] = useState(null);
  const [myProductsCatalogError, setMyProductsCatalogError] = useState("");
  /** @type {import('react').RefObject<HTMLDivElement | null>} */
  const productCategoryFilterRef = useRef(null);

  const visibleProducts = useMemo(() => {
    const base =
      onlyMyProductsCatalog !== null ? onlyMyProductsCatalog : products;
    if (!selectedProductCategory) return base;
    return base.filter((p) => p.productCategory === selectedProductCategory);
  }, [products, selectedProductCategory, onlyMyProductsCatalog]);

  useEffect(() => {
    if (!isProductCategoryListOpen) return;

    const handlePointerDown = (event) => {
      const root = productCategoryFilterRef.current;
      if (
        root &&
        event.target instanceof Node &&
        !root.contains(event.target)
      ) {
        setIsProductCategoryListOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isProductCategoryListOpen]);

  useEffect(() => {
    if (!isAuthorized) {
      setOnlyMyProductsCatalog(null);
      setMyProductsCatalogError("");
    }
  }, [isAuthorized]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const list = await fetchAllProducts();
        if (cancelled) return;
        setProducts(list);
        setStatus({ kind: "idle" });
      } catch (e) {
        if (cancelled) return;
        const message =
          e?.response?.data?.message ??
          e?.message ??
          HOME_PAGE_UI.FETCH_PRODUCTS_FALLBACK;
        setStatus({ kind: "error", message });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const closeSellerModal = () => {
    sellerFetchSeq.current += 1;
    setSellerModal({ open: false, phase: "idle", user: null, error: "" });
  };

  const closeMyProfileModal = () => {
    setMyProfileModal({ open: false, phase: "idle", user: null, error: "" });
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      // storage недоступен
    }
    setIsAuthorized(false);
    closeMyProfileModal();
  };

  /**
   * @param {string} userId
   */
  const handleSellerNameClick = (userId) => {
    const seq = ++sellerFetchSeq.current;
    setSellerModal({ open: true, phase: "loading", user: null, error: "" });

    void (async () => {
      try {
        const user = await fetchUserProfileById(userId);
        if (seq !== sellerFetchSeq.current) return;
        setSellerModal({ open: true, phase: "success", user, error: "" });
      } catch (e) {
        if (seq !== sellerFetchSeq.current) return;
        const error =
          e instanceof Error ? e.message : HOME_PAGE_UI.FETCH_PROFILE_FALLBACK;
        setSellerModal({ open: true, phase: "error", user: null, error });
      }
    })();
  };

  const handleProductCategoryFilterToggle = () => {
    setIsProductCategoryListOpen((open) => !open);
  };

  /**
   * @param {ProductCategory | null} category
   */
  const handleProductCategorySelect = (category) => {
    setSelectedProductCategory(category);
    setIsProductCategoryListOpen(false);
  };

  const handleMyProfileClick = () => {
    setMyProfileModal({ open: true, phase: "loading", user: null, error: "" });

    void (async () => {
      try {
        const user = await fetchCurrentUserProfile();
        setMyProfileModal({ open: true, phase: "success", user, error: "" });
      } catch (e) {
        const error =
          e instanceof Error
            ? e.message
            : HOME_PAGE_UI.FETCH_MY_PROFILE_FALLBACK;
        setMyProfileModal({ open: true, phase: "error", user: null, error });
      }
    })();
  };

  const handleNavigateToFullCatalogFromBreadcrumb = () => {
    setOnlyMyProductsCatalog(null);
    setMyProductsCatalogError("");
    setMainView("catalog");
    setSelectedProductCategory(null);
    setIsProductCategoryListOpen(false);
  };

  const handleMyProductsFromProfile = async () => {
    if (myProfileModal.phase !== "success" || !myProfileModal.user?._id) return;
    setMyProductsCatalogError("");
    try {
      const list = await fetchMyProducts();
      setOnlyMyProductsCatalog(list);
      closeMyProfileModal();
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.FETCH_MY_PRODUCTS_FALLBACK;
      setMyProductsCatalogError(message);
    }
  };

  if (status.kind === "loading") {
    return (
      <div className="home-page">
        <p className="home-page__state">{HOME_PAGE_UI.LOADING_CATALOG}</p>
      </div>
    );
  }

  if (status.kind === "error") {
    return (
      <div className="home-page">
        <p className="home-page__state home-page__state_error" role="alert">
          {status.message}
        </p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-page__header">
        <div>
          {mainView === "users" ? (
            <div className="home-page__title-row">
              <button
                type="button"
                className="home-page__title-nav"
                onClick={() => setMainView("catalog")}
              >
                {HOME_PAGE_UI.NAV_TO_CATALOG}
              </button>
              <h1 className="home-page__title home-page__title_inline">
                {HOME_PAGE_UI.TITLE_USERS}
              </h1>
            </div>
          ) : (
            <>
              <div className="home-page__title-row">
                <h1
                  className="home-page__title home-page__title_inline"
                  aria-label={
                    onlyMyProductsCatalog !== null
                      ? HOME_PAGE_UI.ARIA_MY_PRODUCTS_CRUMB
                      : undefined
                  }
                >
                  {onlyMyProductsCatalog !== null ? (
                    <span className="home-page__breadcrumb">
                      <button
                        type="button"
                        className="home-page__breadcrumb-link"
                        onClick={handleNavigateToFullCatalogFromBreadcrumb}
                      >
                        {HOME_PAGE_UI.BREADCRUMB_HOME}
                      </button>
                      <span
                        className="home-page__breadcrumb-sep"
                        aria-hidden="true"
                      >
                        {HOME_PAGE_UI.BREADCRUMB_SEPARATOR}
                      </span>
                      <span className="home-page__breadcrumb-text">
                        {HOME_PAGE_UI.BREADCRUMB_MY_PROFILE}
                      </span>
                      <span
                        className="home-page__breadcrumb-sep"
                        aria-hidden="true"
                      >
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
                {onlyMyProductsCatalog === null ? (
                  <button
                    type="button"
                    className="home-page__title-nav"
                    onClick={() => setMainView("users")}
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
                  onClick={handleProductCategoryFilterToggle}
                >
                  {HOME_PAGE_UI.FILTER_BUTTON}
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
                        onClick={() => handleProductCategorySelect(null)}
                      >
                        {HOME_PAGE_UI.CATEGORY_ALL}
                      </button>
                    </li>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <li key={category} className="home-page__category-item">
                        <button
                          type="button"
                          className="home-page__category-option"
                          onClick={() => handleProductCategorySelect(category)}
                        >
                          {PRODUCT_CATEGORY_LABEL_RU[category]}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <p className="home-page__subtitle">
                {onlyMyProductsCatalog !== null
                  ? HOME_PAGE_UI.SUBTITLE_MY_ONLY
                  : HOME_PAGE_UI.SUBTITLE_ALL_PRODUCTS}
              </p>
            </>
          )}
        </div>
        <div className="home-page__auth-actions">
          {isAuthorized ? (
            <button
              type="button"
              className="home-page__auth-button home-page__auth-button_secondary"
              onClick={handleMyProfileClick}
            >
              {HOME_PAGE_UI.AUTH_MY_PROFILE}
            </button>
          ) : (
            <button
              type="button"
              className="home-page__auth-button home-page__auth-button_secondary"
              onClick={() => setIsLoginModalOpen(true)}
            >
              {HOME_PAGE_UI.AUTH_LOGIN}
            </button>
          )}
          {!isAuthorized ? (
            <button
              type="button"
              className="home-page__auth-button"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              {HOME_PAGE_UI.AUTH_REGISTER}
            </button>
          ) : null}
        </div>
      </header>
      {mainView === "users" ? (
        <UsersPage onUserRowClick={handleSellerNameClick} />
      ) : (
        <>
          {myProductsCatalogError ? (
            <p className="home-page__state home-page__state_error" role="alert">
              {myProductsCatalogError}
            </p>
          ) : null}
          {onlyMyProductsCatalog !== null &&
          onlyMyProductsCatalog.length === 0 ? (
            <p className="home-page__state">{HOME_PAGE_UI.EMPTY_MY_PRODUCTS}</p>
          ) : onlyMyProductsCatalog === null && products.length === 0 ? (
            <p className="home-page__state">{HOME_PAGE_UI.EMPTY_NO_PRODUCTS}</p>
          ) : visibleProducts.length === 0 ? (
            <p className="home-page__state">
              {onlyMyProductsCatalog !== null
                ? HOME_PAGE_UI.EMPTY_MY_FILTERED
                : HOME_PAGE_UI.EMPTY_CATEGORY}
            </p>
          ) : (
            <div className="home-page__grid" role="list">
              {visibleProducts.map((product) => (
                <div
                  key={product._id}
                  className="home-page__cell"
                  role="listitem"
                >
                  <ProductCard
                    product={product}
                    onSellerNameClick={handleSellerNameClick}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <UserDetailsModal
        isOpen={sellerModal.open}
        onClose={closeSellerModal}
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        isLoading={sellerModal.phase === "loading"}
        errorMessage={sellerModal.phase === "error" ? sellerModal.error : null}
      />
      <MyProfileModal
        isOpen={myProfileModal.open}
        onClose={closeMyProfileModal}
        user={myProfileModal.phase === "success" ? myProfileModal.user : null}
        isLoading={myProfileModal.phase === "loading"}
        errorMessage={
          myProfileModal.phase === "error" ? myProfileModal.error : null
        }
        onLogout={handleLogout}
        onMyProductsClick={handleMyProductsFromProfile}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsAuthorized(true);
          setIsLoginModalOpen(false);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setIsAuthorized(true);
          setIsRegisterModalOpen(false);
        }}
      />
    </div>
  );
}
