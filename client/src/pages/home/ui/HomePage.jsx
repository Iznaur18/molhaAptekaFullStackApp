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
  CATALOG_SORT_PREMIUM,
  CATALOG_SORT_CONFIRMED,
  MY_PRODUCTS_MODERATION_FILTER_ALL,
} from "../../../entities/product/model/productConstants.js";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { getSellerProductsLimit } from "../../../entities/product/lib/sellerProductsLimit.js";
import { CreateProductModal } from "../../../entities/product/ui/CreateProductModal.jsx";
import { SellerProductsLimitModal } from "../../../entities/product/ui/SellerProductsLimitModal.jsx";
import { ProductDetailsAdminFooter } from "../../../entities/product/ui/ProductDetailsAdminFooter.jsx";
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
import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
} from "../../../entities/user/model/userConstants.js";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../../../entities/product/model/productModerationConstants.js";
import { ProductModerationPage } from "../../product-moderation/ui/ProductModerationPage.jsx";
import { ProductReportsPage } from "../../product-reports/ui/ProductReportsPage.jsx";
import { DataConfirmationRequestsPage } from "../../data-confirmation-requests/ui/DataConfirmationRequestsPage.jsx";
import { fetchPendingProductReportsCount } from "../../../entities/product-report/api/fetchPendingProductReportsCount.js";
import { fetchPendingDataConfirmationCount } from "../../../entities/user-data-confirmation/api/fetchPendingDataConfirmationCount.js";
import { DataConfirmationRequestModal } from "../../../entities/user-data-confirmation/ui/DataConfirmationRequestModal.jsx";
import { fetchMyProductReportStatus } from "../../../entities/product-report/api/fetchMyProductReportStatus.js";
import { ReportProductModal } from "../../../entities/product-report/ui/ReportProductModal.jsx";
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
  PRODUCT_REPORT_MODAL_UI,
  PRODUCT_SEARCH_UI,
} from "../../../shared/config/appUiCopy.js";
import {
  isCatalogShellMainView,
  isMyProductsMainView,
  mainViewToPathname,
  pathnameToMainView,
} from "../../../shared/lib/homeMainViewPaths.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";

import { HomeCatalogGrid } from "./HomeCatalogGrid.jsx";
import { HomePageHeader } from "./HomePageHeader.jsx";

import "./HomePage.css";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */
/** @typedef {{ open: boolean; phase: 'idle'|'loading'|'success'|'error'; user: import('../../../entities/user/model/types.js').UserPublicProfile | null; error: string }} ProfileModalState */
/** @typedef {'catalog' | 'my-products' | 'users' | 'cart' | 'my-sales' | 'my-orders' | 'admin-orders' | 'product-moderation' | 'product-reports' | 'data-confirmation-requests'} HomeMainView */

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
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      setCurrentUserId(null);
      setCurrentUserRole(null);
      setIsPremiumUser(false);
      return undefined;
    }
    let isCancelled = false;

    void (async () => {
      try {
        const { user: me } = await fetchCurrentUserProfile();
        if (!isCancelled) {
          setCurrentUserId(String(me._id));
          setCurrentUserRole(me.userRole ?? "user");
          setIsPremiumUser(Boolean(me.isPremiumUser));
        }
      } catch {
        if (!isCancelled) {
          setCurrentUserId(null);
          setCurrentUserRole(null);
          setIsPremiumUser(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized]);

  return [currentUserId, currentUserRole, isPremiumUser, setCurrentUserId];
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
  const [myProductsModerationFilter, setMyProductsModerationFilter] =
    useState(MY_PRODUCTS_MODERATION_FILTER_ALL);
  const [myProductsCatalogError, setMyProductsCatalogError] = useState("");
  const [myProductsCatalogNotice, setMyProductsCatalogNotice] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [togglingAvailabilityProductId, setTogglingAvailabilityProductId] =
    useState(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [isSellerProductsLimitModalOpen, setIsSellerProductsLimitModalOpen] =
    useState(false);
  /** @type {[import('../../../entities/product/model/types.js').ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<import('../../../entities/product/model/types.js').ProductFromApi | null>>]} */
  const [productToEdit, setProductToEdit] = useState(null);
  const [usersListTick, setUsersListTick] = useState(0);
  const [catalogRefreshTick, setCatalogRefreshTick] = useState(0);
  const [currentUserId, currentUserRole, isPremiumUser, setCurrentUserId] =
    useCurrentUserSession(isAuthorized);
  const [myProductsTotal, setMyProductsTotal] = useState(
    /** @type {number | null} */ (null),
  );
  const isAdmin = currentUserRole === USER_ROLE_ADMIN;
  const sellerProductsLimit = useMemo(() => {
    if (isAdmin) return null;
    return getSellerProductsLimit({ isPremiumUser });
  }, [isAdmin, isPremiumUser]);
  const isAtSellerProductsLimit =
    sellerProductsLimit != null &&
    myProductsTotal != null &&
    myProductsTotal >= sellerProductsLimit;
  const canModerateProducts =
    currentUserRole === USER_ROLE_ADMIN ||
    currentUserRole === USER_ROLE_MODERATOR;

  useEffect(() => {
    if (mainView === "admin-orders" && !isAdmin) {
      goToMainView("catalog");
      return;
    }
    if (mainView === "product-moderation" && !canModerateProducts) {
      goToMainView("catalog");
      return;
    }
    if (mainView === "product-reports" && !canModerateProducts) {
      goToMainView("catalog");
    }
    if (mainView === "data-confirmation-requests" && !canModerateProducts) {
      goToMainView("catalog");
    }
  }, [mainView, isAdmin, canModerateProducts, goToMainView]);

  const refreshPendingProductReportsCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingProductReportsCount(0);
      return;
    }
    try {
      const count = await fetchPendingProductReportsCount();
      setPendingProductReportsCount(count);
    } catch {
      setPendingProductReportsCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingProductReportsCount();
  }, [refreshPendingProductReportsCount, mainView]);

  const refreshPendingDataConfirmationCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingDataConfirmationCount(0);
      return;
    }
    try {
      const count = await fetchPendingDataConfirmationCount();
      setPendingDataConfirmationCount(count);
    } catch {
      setPendingDataConfirmationCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingDataConfirmationCount();
  }, [refreshPendingDataConfirmationCount, mainView]);

  const [showHiddenCatalogProducts, setShowHiddenCatalogProducts] =
    useState(false);
  const [isAdminEditUserOpen, setIsAdminEditUserOpen] = useState(false);
  const [isAdminDeleteUserOpen, setIsAdminDeleteUserOpen] = useState(false);
  /** @type {[ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<ProductFromApi | null>>]} */
  const [catalogProductDetails, setCatalogProductDetails] = useState(null);
  const [productDetailsAdminError, setProductDetailsAdminError] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [pendingProductReportsCount, setPendingProductReportsCount] =
    useState(0);
  const [pendingDataConfirmationCount, setPendingDataConfirmationCount] =
    useState(0);
  const [isDataConfirmationModalOpen, setIsDataConfirmationModalOpen] =
    useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(
    /** @type {import('../../../entities/product-report/model/types.js').UserInAppNotification[]} */ ([]),
  );
  const [isReportProductModalOpen, setIsReportProductModalOpen] =
    useState(false);
  const [catalogProductHasPendingReport, setCatalogProductHasPendingReport] =
    useState(false);

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
  const isMineMode = isMyProductsMainView(mainView);
  const canReportCatalogProduct = useMemo(() => {
    if (!isAuthorized || !catalogProductDetails || !currentUserId) {
      return false;
    }
    if (
      catalogProductDetails.productModerationStatus !==
      PRODUCT_MODERATION_APPROVED
    ) {
      return false;
    }
    return !isCurrentUserProductSeller(catalogProductDetails, currentUserId);
  }, [isAuthorized, catalogProductDetails, currentUserId]);

  const catalogDetailsShowAddToCart = useMemo(() => {
    const product = catalogProductDetails;
    if (!product) {
      return false;
    }
    if (isMineMode || canModerateProducts || isAdmin) {
      return false;
    }
    if (isCurrentUserProductSeller(product, currentUserId)) {
      return false;
    }
    return true;
  }, [
    catalogProductDetails,
    isMineMode,
    canModerateProducts,
    isAdmin,
    currentUserId,
  ]);

  useEffect(() => {
    if (!isAuthorized) {
      setMyProductsCatalogError("");
      setMyProductsTotal(null);
      setMyProductsModerationFilter(MY_PRODUCTS_MODERATION_FILTER_ALL);
      if (isMyProductsMainView(mainView)) {
        goToMainView("catalog");
      }
    }
  }, [isAuthorized, mainView, goToMainView]);

  useEffect(() => {
    if (!isMineMode) {
      setMyProductsModerationFilter(MY_PRODUCTS_MODERATION_FILTER_ALL);
    }
  }, [isMineMode]);

  useEffect(() => {
    if (
      isMineMode &&
      (catalogSort === CATALOG_SORT_PREMIUM ||
        catalogSort === CATALOG_SORT_CONFIRMED)
    ) {
      setCatalogSort(CATALOG_SORT_NEWEST);
    }
  }, [isMineMode, catalogSort]);

  useEffect(() => {
    if (!isAuthorized || isAdmin) {
      setMyProductsTotal(null);
      return undefined;
    }

    let isCancelled = false;
    void (async () => {
      try {
        const { pagination } = await fetchMyProductsPage({ page: 1, limit: 1 });
        if (!isCancelled) {
          setMyProductsTotal(pagination.total);
        }
      } catch {
        if (!isCancelled) {
          setMyProductsTotal(null);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setShowHiddenCatalogProducts(false);
    }
  }, [isAdmin]);

  const loadCatalogPage = useCallback(
    async (pageNum) => {
      const search = debouncedProductSearchTerm.trim();
      const productCategory = selectedProductCategory ?? undefined;
      if (isMineMode) {
        return fetchMyProductsPage({
          page: pageNum,
          limit: CATALOG_PAGE_SIZE,
          search: search || undefined,
          productCategory,
          sort: catalogSort,
          moderationStatus: myProductsModerationFilter || undefined,
        });
      }
      return fetchCatalogProductsPage({
        page: pageNum,
        limit: CATALOG_PAGE_SIZE,
        search: search || undefined,
        productCategory,
        sort: catalogSort,
        includeHidden:
          isAdmin && !isMineMode && showHiddenCatalogProducts,
      });
    },
    [
      isMineMode,
      debouncedProductSearchTerm,
      selectedProductCategory,
      catalogSort,
      myProductsModerationFilter,
      isAdmin,
      showHiddenCatalogProducts,
    ],
  );

  useEffect(() => {
    if (!isCatalogShellMainView(mainView)) {
      return undefined;
    }

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
        if (
          isMineMode &&
          !debouncedProductSearchTerm.trim() &&
          !selectedProductCategory &&
          !myProductsModerationFilter
        ) {
          setMyProductsTotal(pagination.total);
        }
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
  }, [
    mainView,
    isMineMode,
    debouncedProductSearchTerm,
    selectedProductCategory,
    catalogSort,
    myProductsModerationFilter,
    showHiddenCatalogProducts,
    loadCatalogPage,
    catalogRefreshTick,
  ]);

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
    if (!isCatalogShellMainView(mainView)) return undefined;
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
        const { user, inAppNotifications: notifications } =
          await fetchCurrentUserProfile();
        setInAppNotifications(notifications);
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
    setMyProductsCatalogError("");
    goToMainView("catalog");
    setSelectedProductCategory(null);
    setIsProductCategoryListOpen(false);
  };

  const handleMyProductsFromProfile = () => {
    if (myProfileModal.phase !== "success" || !myProfileModal.user?._id) return;
    setMyProductsCatalogError("");
    goToMainView("my-products");
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

  const handleProductModerationFromProfile = () => {
    goToMainView("product-moderation");
    closeMyProfileModal();
  };

  const handleProductReportsFromProfile = () => {
    goToMainView("product-reports");
    closeMyProfileModal();
  };

  const handleDataConfirmationQueueFromProfile = () => {
    goToMainView("data-confirmation-requests");
    closeMyProfileModal();
  };

  const handleDataConfirmationFromProfile = () => {
    closeMyProfileModal();
    setIsDataConfirmationModalOpen(true);
  };

  useEffect(() => {
    if (!catalogProductDetails?._id || !isAuthorized) {
      setCatalogProductHasPendingReport(false);
      return undefined;
    }

    let isCancelled = false;
    void (async () => {
      try {
        const { hasPendingReport } = await fetchMyProductReportStatus(
          String(catalogProductDetails._id),
        );
        if (!isCancelled) {
          setCatalogProductHasPendingReport(hasPendingReport);
        }
      } catch {
        if (!isCancelled) {
          setCatalogProductHasPendingReport(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [catalogProductDetails?._id, isAuthorized]);

  /** @param {ProductFromApi} product */
  const handleCreateProductSuccess = (product) => {
    goToMainView("my-products");
    setMyProductsCatalogNotice(
      product.productModerationStatus === PRODUCT_MODERATION_PENDING
        ? API_CLIENT_UI.CREATE_PRODUCT_PENDING_HINT
        : "",
    );
    setMyProductsTotal((prev) => (prev != null ? prev + 1 : prev));
    setProducts((prev) => {
      const id = String(product._id);
      const without = prev.filter((p) => String(p._id) !== id);
      return [product, ...without];
    });
  };

  const handlePlaceProductClick = () => {
    if (isAtSellerProductsLimit) {
      setIsSellerProductsLimitModalOpen(true);
      return;
    }
    setIsCreateProductModalOpen(true);
  };

  /** @param {import('../../../entities/product/model/types.js').ProductFromApi} product */
  const handleOpenEditMyProduct = (product) => {
    if (product.productModerationStatus === PRODUCT_MODERATION_PENDING) {
      return;
    }
    setProductToEdit(product);
  };

  const handleCloseEditProductModal = () => {
    setProductToEdit(null);
  };

  /** @param {import('../../../entities/product/model/types.js').ProductFromApi} product */
  const syncCatalogProductState = (product) => {
    const id = String(product._id);
    setCatalogProductDetails((prev) =>
      prev && String(prev._id) === id
        ? {
            ...product,
            hasOpenSales: prev.hasOpenSales ?? product.hasOpenSales,
          }
        : prev,
    );
    setProducts((prev) => {
      if (
        product.productIsAvailable === false &&
        !isMineMode &&
        !showHiddenCatalogProducts
      ) {
        return prev.filter((p) => String(p._id) !== id);
      }
      if (
        selectedProductCategory &&
        product.productCategory !== selectedProductCategory
      ) {
        return prev.filter((p) => String(p._id) !== id);
      }
      if (!prev.some((p) => String(p._id) === id)) {
        return prev;
      }
      return prev.map((p) =>
        String(p._id) === id
          ? { ...product, hasOpenSales: p.hasOpenSales ?? product.hasOpenSales }
          : p,
      );
    });
  };

  /** @param {import('../../../entities/product/model/types.js').ProductFromApi} product */
  const handleEditProductSuccess = (product) => {
    syncCatalogProductState(product);
    setProductToEdit(null);
  };

  const handleAdminOpenEditProductFromDetails = () => {
    if (!catalogProductDetails) return;
    setProductToEdit(catalogProductDetails);
    setCatalogProductDetails(null);
    setProductDetailsAdminError("");
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
      setMyProductsTotal((prev) =>
        prev != null && prev > 0 ? prev - 1 : prev,
      );
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

  /** @param {string} productId */
  const handleAdminDeleteCatalogProduct = async (productId) => {
    try {
      setDeletingProductId(productId);
      setProductDetailsAdminError("");
      await deleteMyProduct(productId);
      setProducts((prev) => prev.filter((p) => String(p._id) !== productId));
      setCatalogProductDetails((prev) =>
        prev && String(prev._id) === productId ? null : prev,
      );
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK;
      setProductDetailsAdminError(message);
    } finally {
      setDeletingProductId(null);
    }
  };

  /**
   * @param {string} productId
   * @param {boolean} productIsAvailable
   */
  const handleAdminCatalogProductAvailability = async (
    productId,
    productIsAvailable,
  ) => {
    try {
      setTogglingAvailabilityProductId(productId);
      setProductDetailsAdminError("");
      const updated = await patchMyProduct(productId, {
        productIsAvailable,
      });
      if (!productIsAvailable && !showHiddenCatalogProducts) {
        setProducts((prev) => prev.filter((p) => String(p._id) !== productId));
        setCatalogProductDetails(null);
        return;
      }
      syncCatalogProductState(updated);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK;
      setProductDetailsAdminError(message);
    } finally {
      setTogglingAvailabilityProductId(null);
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
      if (!isAdmin) return null;
      return <AdminOrdersPage />;
    }
    if (mainView === "product-moderation") {
      if (!canModerateProducts) return null;
      return (
        <ProductModerationPage onSellerNameClick={handleSellerNameClick} />
      );
    }
    if (mainView === "product-reports") {
      if (!canModerateProducts) return null;
      return (
        <ProductReportsPage
          onSellerNameClick={handleSellerNameClick}
          onProductClick={(product) => setCatalogProductDetails(product)}
          onQueueChanged={() => void refreshPendingProductReportsCount()}
        />
      );
    }
    if (mainView === "data-confirmation-requests") {
      if (!canModerateProducts) return null;
      return (
        <DataConfirmationRequestsPage
          onApplicantClick={handleSellerNameClick}
          onQueueChanged={() => void refreshPendingDataConfirmationCount()}
        />
      );
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
        myProductsCatalogNotice={myProductsCatalogNotice}
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
        myProductsModerationFilter={myProductsModerationFilter}
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
        onPlaceProductClick={handlePlaceProductClick}
        myProductsTotal={myProductsTotal}
        sellerProductsLimit={sellerProductsLimit}
        pendingProductReportsCount={pendingProductReportsCount}
        pendingDataConfirmationCount={pendingDataConfirmationCount}
        onMyProfileClick={handleMyProfileClick}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onNavigateToFullCatalogFromBreadcrumb={
          handleNavigateToFullCatalogFromBreadcrumb
        }
        catalogSort={catalogSort}
        onCatalogSortChange={setCatalogSort}
        isAdmin={isAdmin}
        showHiddenCatalogProducts={showHiddenCatalogProducts}
        onShowHiddenCatalogProductsChange={setShowHiddenCatalogProducts}
        myProductsModerationFilter={myProductsModerationFilter}
        onMyProductsModerationFilterChange={setMyProductsModerationFilter}
      />

      {renderMainContent()}

      <UserDetailsModal
        isOpen={sellerModal.open}
        onClose={closeSellerModal}
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        isLoading={sellerModal.phase === "loading"}
        errorMessage={sellerModal.phase === "error" ? sellerModal.error : null}
        currentUserId={currentUserId}
        isAuthorized={isAuthorized}
        viewerCanSeeOtherUserPurchases={
          isPremiumUser || canModerateProducts
        }
        onPurchaseProductClick={(product) => setCatalogProductDetails(product)}
        footer={
          sellerModal.phase === "success" && sellerModal.user ? (
            canModerateProducts ? (
              <AdminUserModalFooter
                onEditClick={() => setIsAdminEditUserOpen(true)}
                onDeleteClick={
                  isAdmin ? () => setIsAdminDeleteUserOpen(true) : undefined
                }
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
        onAdminOrdersClick={isAdmin ? handleAdminOrdersFromProfile : undefined}
        onProductModerationClick={
          canModerateProducts ? handleProductModerationFromProfile : undefined
        }
        onProductReportsClick={
          canModerateProducts ? handleProductReportsFromProfile : undefined
        }
        onDataConfirmationQueueClick={
          canModerateProducts
            ? handleDataConfirmationQueueFromProfile
            : undefined
        }
        onDataConfirmationClick={
          isAuthorized ? handleDataConfirmationFromProfile : undefined
        }
        pendingProductReportsCount={pendingProductReportsCount}
        pendingDataConfirmationCount={pendingDataConfirmationCount}
        inAppNotifications={inAppNotifications}
        onNotificationsRead={() => setInAppNotifications([])}
      />
      <DataConfirmationRequestModal
        isOpen={isDataConfirmationModalOpen}
        onClose={() => setIsDataConfirmationModalOpen(false)}
        onSubmitted={() => {
          void refreshPendingDataConfirmationCount();
        }}
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
          setIsPremiumUser(Boolean(updatedUser.isPremiumUser));
          setIsEditProfileOpen(false);
        }}
      />
      <EditProfileModal
        isOpen={isAdminEditUserOpen}
        onClose={() => setIsAdminEditUserOpen(false)}
        adminMode
        staffCanEditRole={isAdmin}
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
          const deletedSellerId =
            sellerModal.phase === "success" && sellerModal.user?._id != null
              ? String(sellerModal.user._id)
              : null;
          closeSellerModal();
          setCatalogProductDetails(null);
          setUsersListTick((n) => n + 1);
          setCatalogRefreshTick((n) => n + 1);
          if (deletedSellerId) {
            setProducts((prev) =>
              prev.filter((product) => {
                const seller = product.productSeller;
                if (seller == null) {
                  return true;
                }
                if (typeof seller === "string") {
                  return seller !== deletedSellerId;
                }
                if (typeof seller === "object" && seller._id != null) {
                  return String(seller._id) !== deletedSellerId;
                }
                return true;
              }),
            );
          }
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
      <SellerProductsLimitModal
        isOpen={isSellerProductsLimitModalOpen}
        onClose={() => setIsSellerProductsLimitModalOpen(false)}
        isPremiumUser={isPremiumUser}
        limit={sellerProductsLimit}
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
        onClose={() => {
          setCatalogProductDetails(null);
          setProductDetailsAdminError("");
        }}
        onSellerNameClick={handleSellerNameClick}
        isAuthorized={isAuthorized}
        onProductStatsUpdate={handleProductStatsUpdate}
        showAddToCart={catalogDetailsShowAddToCart}
        onRequestLogin={() => setIsLoginModalOpen(true)}
        currentUserId={currentUserId}
        showStaffDetails={
          canModerateProducts && catalogProductDetails != null
        }
        secondaryFooter={
          canReportCatalogProduct ? (
            <button
              type="button"
              className="product-details-modal__report-btn"
              disabled={catalogProductHasPendingReport}
              onClick={() => {
                if (!isAuthorized) {
                  setIsLoginModalOpen(true);
                  return;
                }
                setIsReportProductModalOpen(true);
              }}
            >
              {catalogProductHasPendingReport
                ? PRODUCT_REPORT_MODAL_UI.ALREADY_REPORTED
                : PRODUCT_REPORT_MODAL_UI.REPORT_BUTTON}
            </button>
          ) : null
        }
        adminFooter={
          isAdmin && catalogProductDetails ? (
            <ProductDetailsAdminFooter
              product={catalogProductDetails}
              onEdit={handleAdminOpenEditProductFromDetails}
              onDelete={handleAdminDeleteCatalogProduct}
              onSetAvailability={handleAdminCatalogProductAvailability}
              isDeletePending={
                deletingProductId === String(catalogProductDetails._id)
              }
              isAvailabilityTogglePending={
                togglingAvailabilityProductId ===
                String(catalogProductDetails._id)
              }
              errorMessage={productDetailsAdminError}
            />
          ) : null
        }
      />
      <ReportProductModal
        isOpen={isReportProductModalOpen}
        productId={
          catalogProductDetails?._id != null
            ? String(catalogProductDetails._id)
            : null
        }
        productName={catalogProductDetails?.productName ?? ""}
        hasPendingReport={catalogProductHasPendingReport}
        onClose={() => setIsReportProductModalOpen(false)}
        onSubmitted={() => {
          setCatalogProductHasPendingReport(true);
        }}
      />
    </div>
  );
}
