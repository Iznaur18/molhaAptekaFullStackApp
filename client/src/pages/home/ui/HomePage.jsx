import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../../../entities/cart/model/useCart.js";
import { CartServerSync } from "../../../entities/cart/ui/CartServerSync.jsx";
import { CART_STORAGE_KEY } from "../../../entities/order/model/constants.js";
import { deleteMyProduct } from "../../../entities/product/api/deleteMyProduct.js";
import { patchMyProduct } from "../../../entities/product/api/patchMyProduct.js";
import { fetchCatalogProductsPage } from "../../../entities/product/api/fetchCatalogProductsPage.js";
import { fetchMyProductsPage } from "../../../entities/product/api/fetchMyProducts.js";
import {
  CATALOG_PAGE_SIZE,
  CATALOG_SORT_NEWEST,
} from "../../../entities/product/model/productConstants.js";
import { CreateProductModal } from "../../../entities/product/ui/CreateProductModal.jsx";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import { fetchUserProfileById } from "../../../entities/user/api/fetchUserProfileById.js";
import { LoginModal } from "../../../entities/user/ui/LoginModal.jsx";
import { MyProfileModal } from "../../../entities/user/ui/MyProfileModal.jsx";
import { AdminDeleteUserConfirmModal } from "../../../entities/user/ui/AdminDeleteUserConfirmModal.jsx";
import { AdminUserModalFooter } from "../../../entities/user/ui/AdminUserModalFooter.jsx";
import { EditProfileModal } from "../../../entities/user/ui/EditProfileModal.jsx";
import { RegisterModal } from "../../../entities/user/ui/RegisterModal.jsx";
import { UserDetailsModal } from "../../../entities/user/ui/UserDetailsModal.jsx";
import { USER_ROLE_ADMIN } from "../../../entities/user/model/userConstants.js";
import { UserVoteRatingForm } from "../../../entities/user-vote-rating/ui/UserVoteRatingForm.jsx";
import { AdminOrdersPage } from "../../admin-orders/ui/AdminOrdersPage.jsx";
import { CartPage } from "../../cart/ui/CartPage.jsx";
import { MyOrdersPage } from "../../my-orders/ui/MyOrdersPage.jsx";
import { MySalesPage } from "../../my-sales/ui/MySalesPage.jsx";
import { UsersPage } from "../../users/ui/UsersPage.jsx";
import { AUTH_TOKEN_STORAGE_KEY } from "../../../shared/api/index.js";
import {
  API_CLIENT_UI,
  HOME_PAGE_UI,
  PRODUCT_SEARCH_UI,
} from "../../../shared/config/appUiCopy.js";
import {
  mainViewToPathname,
  pathnameToMainView,
} from "../../../shared/lib/homeMainViewPaths.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";

import { HomeCatalogGrid } from "./HomeCatalogGrid.jsx";
import { HomePageHeader } from "./HomePageHeader.jsx";

import "./HomePage.css";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */
/** @typedef {{ open: boolean; phase: 'idle'|'loading'|'success'|'error'; user: import('../../../entities/user/model/types.js').UserPublicProfile | null; error: string }} ProfileModalState */
/** @typedef {'all' | 'mine'} ProductsMode */
/** @typedef {'catalog' | 'users' | 'cart' | 'my-sales' | 'my-orders' | 'admin-orders'} HomeMainView */

const EMPTY_PROFILE_MODAL = Object.freeze({
  open: false,
  phase: "idle",
  user: null,
  error: "",
});

const useCurrentUserSession = (isAuthorized) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(
    /** @type {'user'|'admin'|'moderator'|null} */ (null),
  );

  useEffect(() => {
    if (!isAuthorized) {
      setCurrentUserId(null);
      setCurrentUserRole(null);
      return undefined;
    }
    let isCancelled = false;

    void (async () => {
      try {
        const me = await fetchCurrentUserProfile();
        if (!isCancelled) {
          setCurrentUserId(String(me._id));
          setCurrentUserRole(me.userRole ?? "user");
        }
      } catch {
        if (!isCancelled) {
          setCurrentUserId(null);
          setCurrentUserRole(null);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized]);

  return [currentUserId, currentUserRole, setCurrentUserId];
};

export function HomePage() {
  const { flushRemoteCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const mainView = useMemo(() => {
    return pathnameToMainView(location.pathname) ?? "catalog";
  }, [location.pathname]);

  const goToMainView = useCallback(
    (/** @type {HomeMainView} */ view) => {
      navigate(mainViewToPathname(view));
    },
    [navigate],
  );

  useEffect(() => {
    if (pathnameToMainView(location.pathname) !== null) return undefined;
    navigate("/", { replace: true });
    return undefined;
  }, [location.pathname, navigate]);
  /** @type {[ProductsMode, import('react').Dispatch<import('react').SetStateAction<ProductsMode>>]} */
  const [productsMode, setProductsMode] = useState("all");
  /** @type {[ProductFromApi[], import('react').Dispatch<import('react').SetStateAction<ProductFromApi[]>>]} */
  const [products, setProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(() => {
    try {
      return Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    } catch {
      return false;
    }
  });
  const [catalogStatus, setCatalogStatus] = useState({ kind: "loading" });
  /** @type {import('react').MutableRefObject<number>} */
  const sellerFetchSeq = useRef(0);
  const [sellerModal, setSellerModal] = useState(EMPTY_PROFILE_MODAL);
  const [myProfileModal, setMyProfileModal] = useState(EMPTY_PROFILE_MODAL);
  const [isProductCategoryListOpen, setIsProductCategoryListOpen] =
    useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);
  const [catalogSort, setCatalogSort] = useState(CATALOG_SORT_NEWEST);
  const [myProductsCatalogError, setMyProductsCatalogError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [togglingAvailabilityProductId, setTogglingAvailabilityProductId] =
    useState(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  /** @type {[import('../../../entities/product/model/types.js').ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<import('../../../entities/product/model/types.js').ProductFromApi | null>>]} */
  const [productToEdit, setProductToEdit] = useState(null);
  const [usersListTick, setUsersListTick] = useState(0);
  const [currentUserId, currentUserRole, setCurrentUserId] =
    useCurrentUserSession(isAuthorized);
  const isAdmin = currentUserRole === USER_ROLE_ADMIN;
  const [isAdminEditUserOpen, setIsAdminEditUserOpen] = useState(false);
  const [isAdminDeleteUserOpen, setIsAdminDeleteUserOpen] = useState(false);
  /** @type {[ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<ProductFromApi | null>>]} */
  const [catalogProductDetails, setCatalogProductDetails] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const catalogFetchSeq = useRef(0);
  const catalogPageRef = useRef(0);
  const catalogSentinelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [catalogHasMore, setCatalogHasMore] = useState(false);
  const [isCatalogLoadingMore, setIsCatalogLoadingMore] = useState(false);
  const [catalogLoadMoreError, setCatalogLoadMoreError] = useState(
    /** @type {string | null} */ (null),
  );

  const debouncedProductSearchTerm = useDebouncedValue(
    productSearchTerm,
    PRODUCT_SEARCH_UI.DEBOUNCE_MS,
  );
  const isProductSearchPending =
    productSearchTerm !== debouncedProductSearchTerm;
  const hasProductSearchQuery = debouncedProductSearchTerm.trim() !== "";
  const isMineMode = productsMode === "mine";

  useEffect(() => {
    if (!isAuthorized) {
      setProductsMode("all");
      setMyProductsCatalogError("");
    }
  }, [isAuthorized]);

  const loadCatalogPage = useCallback(
    async (pageNum) => {
      const search = debouncedProductSearchTerm.trim();
      const productCategory = selectedProductCategory ?? undefined;
      if (productsMode === "mine") {
        return fetchMyProductsPage({
          page: pageNum,
          limit: CATALOG_PAGE_SIZE,
          search: search || undefined,
          productCategory,
          sort: catalogSort,
        });
      }
      return fetchCatalogProductsPage({
        page: pageNum,
        limit: CATALOG_PAGE_SIZE,
        search: search || undefined,
        productCategory,
        sort: catalogSort,
      });
    },
    [productsMode, debouncedProductSearchTerm, selectedProductCategory, catalogSort],
  );

  useEffect(() => {
    const seq = ++catalogFetchSeq.current;
    setProducts([]);
    catalogPageRef.current = 0;
    setCatalogHasMore(true);
    setCatalogLoadMoreError(null);
    setIsCatalogLoadingMore(false);
    setCatalogStatus({ kind: "loading" });

    void (async () => {
      try {
        const { products, pagination } = await loadCatalogPage(1);
        if (seq !== catalogFetchSeq.current) return;
        setProducts(products);
        catalogPageRef.current = 1;
        setCatalogHasMore(pagination.page < pagination.totalPages);
        setCatalogStatus({ kind: "idle" });
      } catch (e) {
        if (seq !== catalogFetchSeq.current) return;
        const message =
          e?.response?.data?.message ??
          e?.message ??
          HOME_PAGE_UI.FETCH_PRODUCTS_FALLBACK;
        setCatalogStatus({ kind: "error", message });
      }
    })();
  }, [productsMode, debouncedProductSearchTerm, selectedProductCategory, catalogSort, loadCatalogPage]);

  const loadNextCatalogPage = useCallback(async () => {
    if (!catalogHasMore || isCatalogLoadingMore) {
      return;
    }
    if (catalogStatus.kind !== "idle") return;

    const seqAtStart = catalogFetchSeq.current;
    const nextPage = catalogPageRef.current + 1;

    setIsCatalogLoadingMore(true);
    setCatalogLoadMoreError(null);

    try {
      const { products, pagination } = await loadCatalogPage(
        nextPage,
      );
      if (seqAtStart !== catalogFetchSeq.current) return;

      setProducts((prev) => {
        const seen = new Set(prev.map((p) => String(p._id)));
        const addon = products.filter((p) => !seen.has(String(p._id)));
        return [...prev, ...addon];
      });
      catalogPageRef.current = nextPage;
      setCatalogHasMore(pagination.page < pagination.totalPages);
    } catch (e) {
      if (seqAtStart !== catalogFetchSeq.current) return;
      setCatalogLoadMoreError(
        e instanceof Error ? e.message : HOME_PAGE_UI.FETCH_PRODUCTS_FALLBACK,
      );
    } finally {
      if (seqAtStart === catalogFetchSeq.current) {
        setIsCatalogLoadingMore(false);
      }
    }
  }, [
    catalogHasMore,
    isCatalogLoadingMore,
    catalogStatus.kind,
    loadCatalogPage,
  ]);

  useEffect(() => {
    if (mainView !== "catalog") return undefined;
    if (catalogStatus.kind !== "idle") return undefined;
    if (!catalogHasMore || catalogLoadMoreError) return undefined;

    const el = catalogSentinelRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        if (!hit) return;
        void loadNextCatalogPage();
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    mainView,
    catalogStatus.kind,
    catalogHasMore,
    catalogLoadMoreError,
    loadNextCatalogPage,
  ]);

  const handleRetryCatalogLoadMore = useCallback(() => {
    setCatalogLoadMoreError(null);
    void loadNextCatalogPage();
  }, [loadNextCatalogPage]);

  const closeSellerModal = () => {
    sellerFetchSeq.current += 1;
    setSellerModal(EMPTY_PROFILE_MODAL);
    setIsAdminEditUserOpen(false);
    setIsAdminDeleteUserOpen(false);
  };

  const closeMyProfileModal = () => {
    setMyProfileModal(EMPTY_PROFILE_MODAL);
    setIsEditProfileOpen(false);
  };

  const handleLogout = async () => {
    await flushRemoteCart();
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // storage недоступен
    }
    setCurrentUserId(null);
    setIsAuthorized(false);
    closeMyProfileModal();
    navigate("/", { replace: true });
  };

  /** @param {string} userId */
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

  const handleProductCategorySelect = (category) => {
    setSelectedProductCategory(category);
    setIsProductCategoryListOpen(false);
  };

  const handleProductStatsUpdate = useCallback((productId, stats) => {
    setCatalogProductDetails((prev) =>
      prev && String(prev._id) === productId ? { ...prev, ...stats } : prev,
    );
    setProducts((prev) =>
      prev.map((p) =>
        String(p._id) === productId ? { ...p, ...stats } : p,
      ),
    );
  }, []);

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
    setProductsMode("all");
    setMyProductsCatalogError("");
    goToMainView("catalog");
    setSelectedProductCategory(null);
    setIsProductCategoryListOpen(false);
  };

  const handleMyProductsFromProfile = () => {
    if (myProfileModal.phase !== "success" || !myProfileModal.user?._id) return;
    setMyProductsCatalogError("");
    setProductsMode("mine");
    goToMainView("catalog");
    closeMyProfileModal();
  };

  const handleMyOrdersFromProfile = () => {
    goToMainView("my-orders");
    closeMyProfileModal();
  };

  const handleMySalesFromProfile = () => {
    goToMainView("my-sales");
    closeMyProfileModal();
  };

  const handleAdminOrdersFromProfile = () => {
    goToMainView("admin-orders");
    closeMyProfileModal();
  };

  /** @param {ProductFromApi} product */
  const handleCreateProductSuccess = (product) => {
    setProducts((prev) => [product, ...prev]);
  };

  /** @param {import('../../../entities/product/model/types.js').ProductFromApi} product */
  const handleOpenEditMyProduct = (product) => {
    setProductToEdit(product);
  };

  const handleCloseEditProductModal = () => {
    setProductToEdit(null);
  };

  /** @param {import('../../../entities/product/model/types.js').ProductFromApi} product */
  const handleEditProductSuccess = (product) => {
    const id = String(product._id);
    setProducts((prev) => {
      if (
        selectedProductCategory &&
        product.productCategory !== selectedProductCategory
      ) {
        return prev.filter((p) => String(p._id) !== id);
      }
      if (!prev.some((p) => String(p._id) === id)) {
        return prev;
      }
      return prev.map((p) => (String(p._id) === id ? product : p));
    });
    setProductToEdit(null);
  };

  /**
   * @param {string} productId
   * @param {boolean} productIsAvailable
   */
  const handleSetMyProductAvailability = async (productId, productIsAvailable) => {
    try {
      setTogglingAvailabilityProductId(productId);
      setMyProductsCatalogError("");
      const updated = await patchMyProduct(productId, {
        productIsAvailable,
      });
      setProducts((prev) =>
        prev.map((p) =>
          String(p._id) === productId
            ? { ...updated, hasOpenSales: p.hasOpenSales }
            : p,
        ),
      );
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK;
      setMyProductsCatalogError(message);
    } finally {
      setTogglingAvailabilityProductId(null);
    }
  };

  /** @param {string} productId */
  const handleDeleteMyProduct = async (productId) => {
    try {
      setDeletingProductId(productId);
      setMyProductsCatalogError("");
      await deleteMyProduct(productId);
      setProducts((prev) => prev.filter((p) => String(p._id) !== productId));
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK;
      setMyProductsCatalogError(message);
    } finally {
      setDeletingProductId(null);
    }
  };

  const renderMainContent = () => {
    if (mainView === "users") {
      return (
        <UsersPage
          key={usersListTick}
          onUserRowClick={handleSellerNameClick}
          isAdminViewer={isAdmin}
        />
      );
    }
    if (mainView === "cart") {
      return (
        <CartPage
          isAuthorized={isAuthorized}
          onRequestLogin={() => setIsLoginModalOpen(true)}
          onGoToCatalog={() => goToMainView("catalog")}
          onCheckoutSuccess={() => goToMainView("my-orders")}
          onSellerNameClick={handleSellerNameClick}
        />
      );
    }
    if (mainView === "my-orders") {
      return <MyOrdersPage
        isAuthorized={isAuthorized}
        onSellerNameClick={handleSellerNameClick}
      />;
    }
    if (mainView === "my-sales") {
      return <MySalesPage
        isAuthorized={isAuthorized}
        onSellerNameClick={handleSellerNameClick}
      />;
    }
    if (mainView === "admin-orders") {
      return <AdminOrdersPage />;
    }

    if (catalogStatus.kind === "loading" && products.length === 0) {
      return <p className="home-page__state">{HOME_PAGE_UI.LOADING_CATALOG}</p>;
    }
    if (catalogStatus.kind === "error") {
      return (
        <p className="home-page__state home-page__state_error" role="alert">
          {catalogStatus.message}
        </p>
      );
    }
    return (
      <HomeCatalogGrid
        products={products}
        selectedProductCategory={selectedProductCategory}
        hasQuery={hasProductSearchQuery}
        isMineMode={isMineMode}
        deletingProductId={deletingProductId}
        onSellerNameClick={handleSellerNameClick}
        onDeleteMyProduct={handleDeleteMyProduct}
        onEditMyProduct={handleOpenEditMyProduct}
        myProductsCatalogError={myProductsCatalogError}
        onOpenProductDetails={setCatalogProductDetails}
        onSetMyProductAvailability={handleSetMyProductAvailability}
        togglingAvailabilityProductId={togglingAvailabilityProductId}
        isAuthorized={isAuthorized}
        onRequestLoginAddToCart={() => setIsLoginModalOpen(true)}
        catalogSentinelRef={catalogSentinelRef}
        catalogHasMore={catalogHasMore}
        isCatalogLoadingMore={isCatalogLoadingMore}
        catalogLoadMoreError={catalogLoadMoreError}
        onRetryCatalogLoadMore={handleRetryCatalogLoadMore}
      />
    );
  };

  return (
    <div className="home-page">
      <CartServerSync isAuthorized={isAuthorized} />
      <HomePageHeader
        mainView={mainView}
        isMineMode={isMineMode}
        selectedProductCategory={selectedProductCategory}
        isProductCategoryListOpen={isProductCategoryListOpen}
        productSearchTerm={productSearchTerm}
        isProductSearchPending={isProductSearchPending}
        isAuthorized={isAuthorized}
        onSetMainView={goToMainView}
        onProductCategorySelect={handleProductCategorySelect}
        onProductCategoryFilterToggle={() =>
          setIsProductCategoryListOpen((open) => !open)
        }
        onCloseProductCategoryFilter={() => setIsProductCategoryListOpen(false)}
        onProductSearchTermChange={setProductSearchTerm}
        onCreateProductClick={() => setIsCreateProductModalOpen(true)}
        onMyProfileClick={handleMyProfileClick}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onNavigateToFullCatalogFromBreadcrumb={
          handleNavigateToFullCatalogFromBreadcrumb
        }
        catalogSort={catalogSort}
        onCatalogSortChange={setCatalogSort}
      />

      {renderMainContent()}

      <UserDetailsModal
        isOpen={sellerModal.open}
        onClose={closeSellerModal}
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        isLoading={sellerModal.phase === "loading"}
        errorMessage={sellerModal.phase === "error" ? sellerModal.error : null}
        footer={
          sellerModal.phase === "success" && sellerModal.user ? (
            isAdmin ? (
              <AdminUserModalFooter
                onEditClick={() => setIsAdminEditUserOpen(true)}
                onDeleteClick={() => setIsAdminDeleteUserOpen(true)}
              >
                <UserVoteRatingForm
                  key={String(sellerModal.user._id)}
                  targetUser={sellerModal.user}
                  currentUserId={currentUserId}
                  isAuthorized={isAuthorized}
                  onRequestLogin={() => setIsLoginModalOpen(true)}
                  onVotePersisted={() => setUsersListTick((n) => n + 1)}
                  onRated={(snapshot) => {
                    setSellerModal((prev) => {
                      if (prev.phase !== "success" || !prev.user) return prev;
                      return {
                        ...prev,
                        user: {
                          ...prev.user,
                          userRatingByVotes:
                            snapshot.userRatingByVotes ??
                            prev.user.userRatingByVotes,
                        },
                      };
                    });
                  }}
                />
              </AdminUserModalFooter>
            ) : (
              <UserVoteRatingForm
                key={String(sellerModal.user._id)}
                targetUser={sellerModal.user}
                currentUserId={currentUserId}
                isAuthorized={isAuthorized}
                onRequestLogin={() => setIsLoginModalOpen(true)}
                onVotePersisted={() => setUsersListTick((n) => n + 1)}
                onRated={(snapshot) => {
                  setSellerModal((prev) => {
                    if (prev.phase !== "success" || !prev.user) return prev;
                    return {
                      ...prev,
                      user: {
                        ...prev.user,
                        userRatingByVotes:
                          snapshot.userRatingByVotes ??
                          prev.user.userRatingByVotes,
                      },
                    };
                  });
                }}
              />
            )
          ) : null
        }
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
        onEditProfileClick={() => setIsEditProfileOpen(true)}
        onMyProductsClick={handleMyProductsFromProfile}
        onMySalesClick={handleMySalesFromProfile}
        onMyOrdersClick={handleMyOrdersFromProfile}
        onAdminOrdersClick={handleAdminOrdersFromProfile}
      />
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={
          myProfileModal.phase === "success" ? myProfileModal.user : null
        }
        onSaved={(updatedUser) => {
          setMyProfileModal((prev) =>
            prev.open && prev.phase === "success" && prev.user
              ? { ...prev, user: { ...prev.user, ...updatedUser } }
              : prev,
          );
          setIsEditProfileOpen(false);
        }}
      />
      <EditProfileModal
        isOpen={isAdminEditUserOpen}
        onClose={() => setIsAdminEditUserOpen(false)}
        adminMode
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        onSaved={(updatedUser) => {
          setSellerModal((prev) =>
            prev.open && prev.phase === "success" && prev.user
              ? { ...prev, user: { ...prev.user, ...updatedUser } }
              : prev,
          );
          setUsersListTick((n) => n + 1);
          setIsAdminEditUserOpen(false);
        }}
      />
      <AdminDeleteUserConfirmModal
        isOpen={isAdminDeleteUserOpen}
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        onClose={() => setIsAdminDeleteUserOpen(false)}
        onDeleted={() => {
          closeSellerModal();
          setUsersListTick((n) => n + 1);
        }}
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
      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        onSuccess={handleCreateProductSuccess}
      />
      <CreateProductModal
        isOpen={productToEdit != null}
        onClose={handleCloseEditProductModal}
        onSuccess={handleEditProductSuccess}
        mode="edit"
        productToEdit={productToEdit}
      />
      <ProductDetailsModal
        isOpen={catalogProductDetails != null}
        product={catalogProductDetails}
        onClose={() => setCatalogProductDetails(null)}
        onSellerNameClick={handleSellerNameClick}
        isAuthorized={isAuthorized}
        onProductStatsUpdate={handleProductStatsUpdate}
      />
    </div>
  );
}
