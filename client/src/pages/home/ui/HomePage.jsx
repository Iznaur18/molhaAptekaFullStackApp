import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../../../entities/cart/model/useCart.js";
import { CartServerSync } from "../../../entities/cart/ui/CartServerSync.jsx";
import { CART_STORAGE_KEY } from "../../../entities/order/model/constants.js";
import { deleteMyProduct } from "../../../entities/product/api/deleteMyProduct.js";
import { patchMyProduct } from "../../../entities/product/api/patchMyProduct.js";
import { fetchCatalogProductsPage } from "../../../entities/product/api/fetchCatalogProductsPage.js";
import { fetchMyProductsPage } from "../../../entities/product/api/fetchMyProducts.js";
import { fetchProductPromotionTariffs } from "../../../entities/product/api/fetchProductPromotionTariffs.js";
import {
  CATALOG_PAGE_SIZE,
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_PREMIUM,
  CATALOG_SORT_CONFIRMED,
  CATALOG_SORT_VIEWS,
  MY_PRODUCTS_MODERATION_FILTER_ALL,
} from "../../../entities/product/model/productConstants.js";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
} from "../../../entities/product/lib/getProductModerationUi.js";
import { getSellerProductsLimit } from "../../../entities/product/lib/sellerProductsLimit.js";
import { CreateProductModal } from "../../../entities/product/ui/CreateProductModal.jsx";
import { SellerProductsLimitModal } from "../../../entities/product/ui/SellerProductsLimitModal.jsx";
import { ProductDetailsAdminFooter } from "../../../entities/product/ui/ProductDetailsAdminFooter.jsx";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import { ProductPromotionModal } from "../../../entities/product/ui/ProductPromotionModal.jsx";
import { requestProductPromotion } from "../../../entities/product/api/requestProductPromotion.js";
import { fetchMyProductPromotions } from "../../../entities/product/api/fetchMyProductPromotions.js";
import { fetchPendingProductPromotionsCount } from "../../../entities/product/api/fetchPendingProductPromotionsCount.js";
import { deleteMyRaffle } from "../../../entities/raffle/api/deleteMyRaffle.js";
import { deleteRaffleByStaff } from "../../../entities/raffle/api/deleteRaffleByStaff.js";
import { fetchFeaturedRaffles } from "../../../entities/raffle/api/fetchFeaturedRaffle.js";
import { fetchMyRaffle } from "../../../entities/raffle/api/fetchMyRaffle.js";
import { fetchPendingRafflesCount } from "../../../entities/raffle/api/fetchPendingRafflesCount.js";
import { pauseMyRaffle } from "../../../entities/raffle/api/pauseMyRaffle.js";
import { setProductRaffleParticipation } from "../../../entities/raffle/api/setProductRaffleParticipation.js";
import { canSellerEditRaffle } from "../../../entities/raffle/lib/canSellerEditRaffle.js";
import { CreateRaffleModal } from "../../../entities/raffle/ui/CreateRaffleModal.jsx";
import { RaffleFeaturedCarousel } from "../../../entities/raffle/ui/RaffleFeaturedCarousel.jsx";
import { RaffleSellerOverview } from "../../../entities/raffle/ui/RaffleSellerOverview.jsx";
import { RafflesStaffPage } from "../../raffles-staff/ui/RafflesStaffPage.jsx";
import { RaffleProductsPage } from "../../raffle/ui/RaffleProductsPage.jsx";
import { ProductPromotionsStaffPage } from "../../product-promotions/ui/ProductPromotionsStaffPage.jsx";
import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import { markInAppNotificationsRead } from "../../../entities/user/api/markInAppNotificationsRead.js";
import { fetchUserProfileById } from "../../../entities/user/api/fetchUserProfileById.js";
import { LoginModal } from "../../../entities/user/ui/LoginModal.jsx";
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
import { fetchPendingModerationProductsCount } from "../../../entities/product/api/fetchPendingModerationProductsCount.js";
import { fetchPendingProductReportsCount } from "../../../entities/product-report/api/fetchPendingProductReportsCount.js";
import { fetchPendingUserStoryReportsCount } from "../../../entities/user-story/api/fetchPendingUserStoryReportsCount.js";
import { fetchUserStoriesFeed } from "../../../entities/user-story/api/fetchUserStoriesFeed.js";
import { UserStoriesStrip } from "../../../entities/user-story/ui/UserStoriesStrip.jsx";
import { fetchPendingDataConfirmationCount } from "../../../entities/user-data-confirmation/api/fetchPendingDataConfirmationCount.js";
import { DataConfirmationRequestModal } from "../../../entities/user-data-confirmation/ui/DataConfirmationRequestModal.jsx";
import { fetchMyProductReportStatus } from "../../../entities/product-report/api/fetchMyProductReportStatus.js";
import { ReportProductModal } from "../../../entities/product-report/ui/ReportProductModal.jsx";
import { UserVoteRatingForm } from "../../../entities/user-vote-rating/ui/UserVoteRatingForm.jsx";
import { SiteFooter } from "../../../widgets/site-footer/ui/SiteFooter.jsx";
import { AdminOrdersPage } from "../../admin-orders/ui/AdminOrdersPage.jsx";
import { CartPage } from "../../cart/ui/CartPage.jsx";
import { MyOrdersPage } from "../../my-orders/ui/MyOrdersPage.jsx";
import {
  normalizeProfileTab,
  PROFILE_TAB_ADMIN_ORDERS,
  PROFILE_TAB_DATA_CONFIRMATION_REQUESTS,
  PROFILE_TAB_MY_ORDERS,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_MY_SALES,
  PROFILE_TAB_OVERVIEW,
  PROFILE_TAB_PRODUCT_MODERATION,
  PROFILE_TAB_PRODUCT_REPORTS,
  PROFILE_TAB_PRODUCT_PROMOTIONS,
  PROFILE_TAB_RAFFLES,
  PROFILE_TAB_SUBSCRIPTIONS,
} from "../../my-profile/lib/profileTabs.js";
import { MyProfilePage } from "../../my-profile/ui/MyProfilePage.jsx";
import { MySalesPage } from "../../my-sales/ui/MySalesPage.jsx";
import { UsersPage } from "../../users/ui/UsersPage.jsx";
import { SubscriptionsPage } from "../../subscriptions/ui/SubscriptionsPage.jsx";
import { NotificationsPage } from "../../notifications/ui/NotificationsPage.jsx";
import { UserFollowButton } from "../../../entities/user-follow/ui/UserFollowButton.jsx";
import {
  IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT,
  IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT,
  IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER,
} from "../../../entities/user-follow/model/constants.js";
import { AUTH_TOKEN_STORAGE_KEY } from "../../../shared/api/index.js";
import {
  API_CLIENT_UI,
  HOME_PAGE_UI,
  PRODUCT_REPORT_MODAL_UI,
  PRODUCT_SEARCH_UI,
  RAFFLE_MANAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import {
  isMyProductsMainView,
  isCatalogBrowserMainView,
  isRoleRestrictedMainView,
  mainViewToPathname,
  pathnameToMainView,
} from "../../../shared/lib/homeMainViewPaths.js";
import { fetchProductCategoryDisplays } from "../../../entities/product-category-display/api/fetchProductCategoryDisplays.js";
import { buildCatalogBrowserLocation } from "../../../entities/product-category-display/lib/catalogBrowserPaths.js";
import { isCatalogBrowserLandingSearch } from "../../../entities/product-category-display/lib/catalogBrowserLanding.js";
import { buildQueryForCatalogFeedTile } from "../../../entities/product-category-display/lib/buildQueryForCatalogFeedTile.js";
import { resolveActiveCatalogFeedLabel } from "../../../entities/product-category-display/lib/resolveActiveCatalogFeedLabel.js";
import {
  resolveProductCategoryDisplay,
} from "../../../entities/product-category-display/lib/resolveProductCategoryDisplay.js";
import { CatalogBrowserLanding } from "../../../entities/product-category-display/ui/CatalogBrowserLanding.jsx";
import { EditProductCategoryDisplayModal } from "../../../entities/product-category-display/ui/EditProductCategoryDisplayModal.jsx";
import "../../../entities/product-category-display/ui/CatalogCategoriesGrid.css";
import "../../../entities/product-category-display/ui/CatalogFeedTilesGrid.css";
import {
  buildRafflePath,
  isRaffleProductsPath,
  parseRaffleIdFromPathname,
} from "../../../shared/lib/rafflePaths.js";
import { getHomePageVariantClass } from "../lib/homeHeaderVariant.js";
import { useInAppNotificationsPoll } from "../lib/useInAppNotificationsPoll.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import {
  areCatalogSearchParamsEqual,
  buildCatalogSearchParams,
  CATALOG_QUERY_PARAM_CATEGORY,
  parseCatalogQueryFromSearchParams,
} from "../lib/catalogCatalogQuery.js";

import { HomeCatalogGrid } from "./HomeCatalogGrid.jsx";
import { HomePageHeader } from "./HomePageHeader.jsx";

import "./HomePage.css";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */
/** @typedef {{ open: boolean; phase: 'idle'|'loading'|'success'|'error'; user: import('../../../entities/user/model/types.js').UserPublicProfile | null; error: string }} ProfileModalState */
/** @typedef {'catalog' | 'catalog-browser' | 'my-profile' | 'my-products' | 'users' | 'subscriptions' | 'notifications' | 'cart' | 'my-sales' | 'my-orders' | 'admin-orders' | 'product-moderation' | 'product-reports' | 'data-confirmation-requests'} HomeMainView */

const EMPTY_PROFILE_MODAL = Object.freeze({
  open: false,
  phase: "idle",
  user: null,
  error: "",
});
const EMPTY_MY_PROFILE_PAGE = Object.freeze({
  phase: "idle",
  user: null,
  error: "",
});

/**
 * @returns {ReturnType<typeof parseCatalogQueryFromSearchParams> | null}
 */
const readInitialCatalogQuery = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/" && path !== "/catalog") {
    return null;
  }
  return parseCatalogQueryFromSearchParams(
    new URLSearchParams(window.location.search),
  );
};

const readInitialCatalogCategory = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/catalog") {
    return null;
  }
  return readInitialCatalogQuery()?.category ?? null;
};

const useCurrentUserSession = (isAuthorized) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(
    /** @type {'user'|'admin'|'moderator'|null} */ (null),
  );
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [rubBalance, setRubBalance] = useState(0);
  const [isSessionReady, setIsSessionReady] = useState(() => !isAuthorized);

  useEffect(() => {
    if (!isAuthorized) {
      setCurrentUserId(null);
      setCurrentUserRole(null);
      setIsPremiumUser(false);
      setLoyaltyPoints(0);
      setRubBalance(0);
      setIsSessionReady(true);
      return undefined;
    }

    setIsSessionReady(false);
    let isCancelled = false;

    void (async () => {
      try {
        const { user: me } = await fetchCurrentUserProfile();
        if (!isCancelled) {
          setCurrentUserId(String(me._id));
          setCurrentUserRole(me.userRole ?? "user");
          setIsPremiumUser(Boolean(me.isPremiumUser));
          setLoyaltyPoints(Number(me.userLoyaltyPoints) || 0);
          setRubBalance(Number(me.userRubBalance) || 0);
        }
      } catch {
        if (!isCancelled) {
          setCurrentUserId(null);
          setCurrentUserRole(null);
          setIsPremiumUser(false);
          setLoyaltyPoints(0);
          setRubBalance(0);
        }
      } finally {
        if (!isCancelled) {
          setIsSessionReady(true);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized]);

  return [
    currentUserId,
    currentUserRole,
    isPremiumUser,
    loyaltyPoints,
    setLoyaltyPoints,
    rubBalance,
    setRubBalance,
    setCurrentUserId,
    isSessionReady,
  ];
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
  const activeProfileTab = useMemo(
    () => normalizeProfileTab(new URLSearchParams(location.search).get("tab")),
    [location.search],
  );
  const raffleRouteId = useMemo(
    () => parseRaffleIdFromPathname(location.pathname),
    [location.pathname],
  );
  const isRaffleRoute = raffleRouteId != null;
  const isProfileMyProductsTab =
    mainView === "my-profile" && activeProfileTab === PROFILE_TAB_MY_PRODUCTS;
  const isHomeCatalogMainView = mainView === "catalog" && !isRaffleRoute;
  const isCatalogBrowserMainViewActive = isCatalogBrowserMainView(mainView);
  const isCatalogShellView =
    isHomeCatalogMainView ||
    isMyProductsMainView(mainView) ||
    isProfileMyProductsTab;

  const setMyProfileTab = useCallback(
    (tab) => {
      const normalizedTab = normalizeProfileTab(tab);
      const nextSearch =
        normalizedTab === PROFILE_TAB_OVERVIEW ? "" : `?tab=${normalizedTab}`;
      navigate(`${mainViewToPathname("my-profile")}${nextSearch}`);
    },
    [navigate],
  );

  useEffect(() => {
    if (pathnameToMainView(location.pathname) !== null) return undefined;
    if (isRaffleProductsPath(location.pathname)) return undefined;
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
  const [myProfilePage, setMyProfilePage] = useState(EMPTY_MY_PROFILE_PAGE);
  const [isProductCategoryListOpen, setIsProductCategoryListOpen] =
    useState(false);
  const [categoryDisplays, setCategoryDisplays] = useState(
    /** @type {import('../../../entities/product-category-display/model/types.js').ProductCategoryDisplayFromApi[]} */ ([]),
  );
  const [categoryDisplaysStatus, setCategoryDisplaysStatus] = useState({
    kind: "idle",
    message: "",
  });
  const [editingCategorySlug, setEditingCategorySlug] = useState(
    /** @type {import('../../../entities/product/model/types.js').ProductCategory | null} */ (null),
  );
  const initialCatalogQuery = useMemo(() => readInitialCatalogQuery(), []);
  const [selectedProductCategory, setSelectedProductCategory] = useState(
    () => readInitialCatalogCategory(),
  );
  const [catalogSort, setCatalogSort] = useState(
    () => initialCatalogQuery?.sort ?? CATALOG_SORT_NEWEST,
  );
  const [myProductsModerationFilter, setMyProductsModerationFilter] =
    useState(MY_PRODUCTS_MODERATION_FILTER_ALL);
  const [myProductsCatalogError, setMyProductsCatalogError] = useState("");
  const [myProductsCatalogNotice, setMyProductsCatalogNotice] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [togglingAvailabilityProductId, setTogglingAvailabilityProductId] =
    useState(null);
  const [togglingAuctionProductId, setTogglingAuctionProductId] =
    useState(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [isSellerProductsLimitModalOpen, setIsSellerProductsLimitModalOpen] =
    useState(false);
  /** @type {[import('../../../entities/product/model/types.js').ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<import('../../../entities/product/model/types.js').ProductFromApi | null>>]} */
  const [productToEdit, setProductToEdit] = useState(null);
  const [usersListTick, setUsersListTick] = useState(0);
  const [catalogRefreshTick, setCatalogRefreshTick] = useState(0);
  const [
    currentUserId,
    currentUserRole,
    isPremiumUser,
    loyaltyPoints,
    setLoyaltyPoints,
    rubBalance,
    setRubBalance,
    setCurrentUserId,
    isSessionReady,
  ] = useCurrentUserSession(isAuthorized);
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
    if (!isSessionReady) {
      return;
    }
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
      return;
    }
    if (mainView === "data-confirmation-requests" && !canModerateProducts) {
      goToMainView("catalog");
    }
  }, [
    mainView,
    isAdmin,
    canModerateProducts,
    goToMainView,
    isSessionReady,
  ]);

  const refreshPendingModerationCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingModerationCount(0);
      return;
    }
    try {
      const count = await fetchPendingModerationProductsCount();
      setPendingModerationCount(count);
    } catch {
      setPendingModerationCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingModerationCount();
  }, [refreshPendingModerationCount, mainView]);

  const refreshPendingProductReportsCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingProductReportsCount(0);
      return;
    }
    try {
      const [productCount, storyCount] = await Promise.all([
        fetchPendingProductReportsCount(),
        fetchPendingUserStoryReportsCount(),
      ]);
      setPendingProductReportsCount(productCount + storyCount);
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
  const [catalogFollowingOnly, setCatalogFollowingOnly] = useState(
    () => initialCatalogQuery?.followingOnly ?? false,
  );
  const [catalogAuctionOnly, setCatalogAuctionOnly] = useState(
    () => initialCatalogQuery?.auctionOnly ?? false,
  );
  const [catalogSaleOnly, setCatalogSaleOnly] = useState(
    () => initialCatalogQuery?.saleOnly ?? false,
  );
  const [isAdminEditUserOpen, setIsAdminEditUserOpen] = useState(false);
  const [isAdminDeleteUserOpen, setIsAdminDeleteUserOpen] = useState(false);
  /** @type {[ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<ProductFromApi | null>>]} */
  const [catalogProductDetails, setCatalogProductDetails] = useState(null);
  const [productDetailsAdminError, setProductDetailsAdminError] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [pendingModerationCount, setPendingModerationCount] = useState(0);
  const [pendingProductReportsCount, setPendingProductReportsCount] =
    useState(0);
  const [pendingDataConfirmationCount, setPendingDataConfirmationCount] =
    useState(0);
  const [pendingProductPromotionsCount, setPendingProductPromotionsCount] =
    useState(0);
  const [pendingRafflesCount, setPendingRafflesCount] = useState(0);
  const [featuredRaffles, setFeaturedRaffles] = useState(
    /** @type {import('../../../entities/raffle/model/types.js').RaffleFromApi[]} */ ([]),
  );
  const [featuredRaffleIndex, setFeaturedRaffleIndex] = useState(0);
  const [userStoriesFeed, setUserStoriesFeed] = useState(
    /** @type {import('../../../entities/user-story/model/types.js').UserStoriesFeedFromApi} */ ({
      rings: [],
      canPublish: false,
      showStrip: false,
    }),
  );
  const [userStoriesRefreshTick, setUserStoriesRefreshTick] = useState(0);
  const [sellerRaffleActive, setSellerRaffleActive] = useState(false);
  const [raffleParticipationPendingProductId, setRaffleParticipationPendingProductId] =
    useState(null);
  const [raffleModal, setRaffleModal] = useState(
    /** @type {{ mode: 'create' } | { mode: 'edit', raffle: import('../../../entities/raffle/model/types.js').RaffleFromApi, useStaffApi: boolean } | null} */ (null),
  );
  const [raffleRefreshTick, setRaffleRefreshTick] = useState(0);
  const [isFeaturedRaffleBusy, setIsFeaturedRaffleBusy] = useState(false);
  const [pendingPromotionProductIds, setPendingPromotionProductIds] = useState(
    /** @type {Set<string>} */ (() => new Set()),
  );

  const refreshPendingProductPromotionsCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingProductPromotionsCount(0);
      return;
    }
    try {
      const count = await fetchPendingProductPromotionsCount();
      setPendingProductPromotionsCount(count);
    } catch {
      setPendingProductPromotionsCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingProductPromotionsCount();
  }, [refreshPendingProductPromotionsCount, mainView]);

  const refreshPendingRafflesCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingRafflesCount(0);
      return;
    }
    try {
      const count = await fetchPendingRafflesCount();
      setPendingRafflesCount(count);
    } catch {
      setPendingRafflesCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingRafflesCount();
  }, [refreshPendingRafflesCount, mainView]);

  const refreshFeaturedRaffle = useCallback(async () => {
    if (!isHomeCatalogMainView) {
      setFeaturedRaffles([]);
      setFeaturedRaffleIndex(0);
      return;
    }
    try {
      const raffles = await fetchFeaturedRaffles();
      setFeaturedRaffles(raffles);
      setFeaturedRaffleIndex(0);
    } catch {
      setFeaturedRaffles([]);
      setFeaturedRaffleIndex(0);
    }
  }, [isHomeCatalogMainView]);

  useEffect(() => {
    void refreshFeaturedRaffle();
  }, [refreshFeaturedRaffle, catalogRefreshTick, raffleRefreshTick]);

  const refreshUserStoriesFeed = useCallback(async () => {
    if (!isHomeCatalogMainView) {
      setUserStoriesFeed({
        rings: [],
        canPublish: false,
        showStrip: false,
      });
      return;
    }
    try {
      const feed = await fetchUserStoriesFeed();
      setUserStoriesFeed(feed);
    } catch {
      setUserStoriesFeed({
        rings: [],
        canPublish: false,
        showStrip: false,
      });
    }
  }, [isHomeCatalogMainView]);

  useEffect(() => {
    void refreshUserStoriesFeed();
  }, [refreshUserStoriesFeed, userStoriesRefreshTick, catalogRefreshTick, isAuthorized]);

  const handleUserStoriesRefresh = useCallback(() => {
    setUserStoriesRefreshTick((value) => value + 1);
  }, []);

  const refreshSellerRaffleState = useCallback(async () => {
    if (!isAuthorized) {
      setSellerRaffleActive(false);
      return;
    }
    try {
      const { raffle } = await fetchMyRaffle();
      setSellerRaffleActive(raffle?.status === "active");
    } catch {
      setSellerRaffleActive(false);
    }
  }, [isAuthorized]);

  const handleFeaturedRaffleEdit = useCallback(
    (raffle) => {
      if (!raffle) {
        return;
      }
      const isOwner =
        currentUserId != null &&
        String(raffle.sellerId) === String(currentUserId);
      setRaffleModal({
        mode: "edit",
        raffle,
        useStaffApi: canModerateProducts && !isOwner,
      });
    },
    [canModerateProducts, currentUserId],
  );

  const handleFeaturedRaffleDelete = useCallback(async (raffle) => {
    if (!raffle?._id) {
      return;
    }
    const isOwner =
      currentUserId != null &&
      String(raffle.sellerId) === String(currentUserId);
    const confirmMessage = isOwner
      ? RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER
      : RAFFLE_MANAGE_UI.DELETE_CONFIRM_STAFF;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      setIsFeaturedRaffleBusy(true);
      if (isOwner) {
        await deleteMyRaffle(raffle._id);
      } else {
        await deleteRaffleByStaff(raffle._id);
      }
      setRaffleRefreshTick((n) => n + 1);
      void refreshFeaturedRaffle();
      void refreshSellerRaffleState();
      void refreshPendingRafflesCount();
    } catch (e) {
      setCatalogStatus({
        kind: "error",
        message:
          e instanceof Error ? e.message : API_CLIENT_UI.DELETE_RAFFLE_FALLBACK,
      });
    } finally {
      setIsFeaturedRaffleBusy(false);
    }
  }, [
    currentUserId,
    refreshFeaturedRaffle,
    refreshPendingRafflesCount,
    refreshSellerRaffleState,
  ]);

  const handleFeaturedRafflePause = useCallback(async (raffle) => {
    if (!raffle?._id) {
      return;
    }
    const isOwner =
      currentUserId != null &&
      String(raffle.sellerId) === String(currentUserId);
    if (!isOwner) {
      return;
    }
    try {
      setIsFeaturedRaffleBusy(true);
      await pauseMyRaffle(raffle._id);
      setRaffleRefreshTick((n) => n + 1);
      void refreshFeaturedRaffle();
      void refreshSellerRaffleState();
    } catch (e) {
      setCatalogStatus({
        kind: "error",
        message:
          e instanceof Error ? e.message : API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK,
      });
    } finally {
      setIsFeaturedRaffleBusy(false);
    }
  }, [currentUserId, refreshFeaturedRaffle, refreshSellerRaffleState]);

  const getFeaturedRaffleManage = useCallback(
    (raffle) => {
      if (!raffle) {
        return null;
      }
      const isOwner =
        currentUserId != null &&
        String(raffle.sellerId) === String(currentUserId);
      const canManage = isOwner || canModerateProducts;
      if (!canManage) {
        return null;
      }
      return {
        showEdit: isOwner
          ? canSellerEditRaffle(raffle)
          : canModerateProducts,
        showDelete: true,
        showPause: isOwner && raffle.status === "active",
        onEdit: () => handleFeaturedRaffleEdit(raffle),
        onDelete: () => void handleFeaturedRaffleDelete(raffle),
        onPause: () => void handleFeaturedRafflePause(raffle),
        busy: isFeaturedRaffleBusy,
      };
    },
    [
      canModerateProducts,
      currentUserId,
      handleFeaturedRaffleDelete,
      handleFeaturedRaffleEdit,
      handleFeaturedRafflePause,
      isFeaturedRaffleBusy,
    ],
  );

  useEffect(() => {
    if (
      mainView === "my-products" ||
      activeProfileTab === PROFILE_TAB_MY_PRODUCTS ||
      mainView === "my-profile"
    ) {
      void refreshSellerRaffleState();
    }
  }, [
    mainView,
    activeProfileTab,
    refreshSellerRaffleState,
    raffleRefreshTick,
    isAuthorized,
  ]);

  const refreshMyPromotionPendingIds = useCallback(async () => {
    if (!isAuthorized) {
      setPendingPromotionProductIds(new Set());
      return;
    }
    try {
      const { promotions } = await fetchMyProductPromotions({
        status: "pending_staff",
        limit: 200,
      });
      setPendingPromotionProductIds(
        new Set(promotions.map((row) => String(row.productId))),
      );
    } catch {
      setPendingPromotionProductIds(new Set());
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (
      mainView === "my-products" ||
      activeProfileTab === PROFILE_TAB_MY_PRODUCTS
    ) {
      void refreshMyPromotionPendingIds();
    }
  }, [mainView, activeProfileTab, refreshMyPromotionPendingIds, catalogRefreshTick]);

  const [isDataConfirmationModalOpen, setIsDataConfirmationModalOpen] =
    useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(
    /** @type {import('../../../entities/product-report/model/types.js').UserInAppNotification[]} */ ([]),
  );
  const [notificationsPageItems, setNotificationsPageItems] = useState(
    /** @type {import('../../../entities/product-report/model/types.js').UserInAppNotification[]} */ ([]),
  );
  const [isReportProductModalOpen, setIsReportProductModalOpen] =
    useState(false);
  const [catalogProductHasPendingReport, setCatalogProductHasPendingReport] =
    useState(false);
  const [promotionProduct, setPromotionProduct] = useState(
    /** @type {ProductFromApi | null} */ (null),
  );
  const [promotionTariffs, setPromotionTariffs] = useState(
    /** @type {Array<{ code: string; title: string; durationHours: number; priceRub: number }>} */ ([]),
  );
  const [promotionModalError, setPromotionModalError] = useState("");
  const [isPromotionSubmitPending, setIsPromotionSubmitPending] = useState(false);

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

  const catalogQueryFromUrl = useMemo(
    () =>
      parseCatalogQueryFromSearchParams(
        new URLSearchParams(location.search),
      ),
    [location.search],
  );

  const handleCatalogSortChange = useCallback(
    (value) => {
      if (catalogAuctionOnly && value === CATALOG_SORT_VIEWS) {
        setCatalogAuctionOnly(false);
      }
      setCatalogSort(value);
    },
    [catalogAuctionOnly],
  );

  const handleShowHiddenCatalogProductsToggle = useCallback(() => {
    setShowHiddenCatalogProducts((prev) => !prev);
  }, []);

  const handleCatalogFollowingOnlyToggle = useCallback(() => {
    if (!isAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }
    setCatalogFollowingOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogAuctionOnly(false);
      }
      return next;
    });
  }, [isAuthorized]);

  const handleCatalogAuctionOnlyToggle = useCallback(() => {
    setCatalogAuctionOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogFollowingOnly(false);
        setCatalogSort((currentSort) =>
          currentSort === CATALOG_SORT_VIEWS
            ? CATALOG_SORT_NEWEST
            : currentSort,
        );
      }
      return next;
    });
  }, []);

  const handleCatalogSaleOnlyToggle = useCallback(() => {
    setCatalogSaleOnly((prev) => !prev);
  }, []);
  const isProductSearchPending =
    productSearchTerm !== debouncedProductSearchTerm;
  const hasProductSearchQuery = debouncedProductSearchTerm.trim() !== "";
  const isMyProductsRoute = isMyProductsMainView(mainView);
  const isMineMode = isMyProductsRoute || isProfileMyProductsTab;
  const activeCatalogBrowserCategory =
    mainView === "catalog-browser" ? catalogQueryFromUrl.category : null;
  const isCatalogBrowserLanding =
    isCatalogBrowserMainViewActive &&
    isCatalogBrowserLandingSearch(location.search, hasProductSearchQuery);
  const isCatalogBrowserProductsView =
    isCatalogBrowserMainViewActive && !isCatalogBrowserLanding;
  const isCatalogProductsView =
    isCatalogShellView || isCatalogBrowserProductsView;

  useEffect(() => {
    if (mainView !== "catalog") {
      return;
    }
    const params = new URLSearchParams(location.search);
    if (!params.has(CATALOG_QUERY_PARAM_CATEGORY)) {
      return;
    }
    const parsed = parseCatalogQueryFromSearchParams(params);
    const built = buildCatalogSearchParams(parsed);
    const search = built.toString();
    navigate(
      `${mainViewToPathname("catalog-browser")}${search ? `?${search}` : ""}`,
      { replace: true },
    );
  }, [mainView, location.search, navigate]);

  useEffect(() => {
    if (mainView !== "catalog" && mainView !== "catalog-browser") {
      return;
    }
    const parsed = parseCatalogQueryFromSearchParams(
      new URLSearchParams(location.search),
    );
    setCatalogSort((prev) => (prev === parsed.sort ? prev : parsed.sort));
    if (mainView === "catalog-browser") {
      setSelectedProductCategory((prev) =>
        prev === parsed.category ? prev : parsed.category,
      );
    } else {
      setSelectedProductCategory(null);
    }
    setCatalogFollowingOnly((prev) =>
      prev === parsed.followingOnly ? prev : parsed.followingOnly,
    );
    setCatalogAuctionOnly((prev) =>
      prev === parsed.auctionOnly ? prev : parsed.auctionOnly,
    );
    setCatalogSaleOnly((prev) =>
      prev === parsed.saleOnly ? prev : parsed.saleOnly,
    );
  }, [location.search, mainView]);

  useEffect(() => {
    if (mainView !== "catalog" && mainView !== "catalog-browser") {
      return;
    }
    const built = buildCatalogSearchParams({
      sort: catalogSort,
      category:
        mainView === "catalog-browser" ? selectedProductCategory : null,
      followingOnly: catalogFollowingOnly,
      auctionOnly: catalogAuctionOnly,
      saleOnly: catalogSaleOnly,
    });
    const current = new URLSearchParams(location.search);
    if (areCatalogSearchParamsEqual(built, current)) {
      return;
    }
    const search = built.toString();
    navigate(
      {
        pathname: mainViewToPathname(mainView),
        search: search ? `?${search}` : "",
      },
      { replace: true },
    );
  }, [
    mainView,
    catalogSort,
    selectedProductCategory,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogSaleOnly,
    navigate,
  ]);

  const refreshCategoryDisplays = useCallback(async () => {
    if (!isCatalogBrowserMainViewActive) {
      return;
    }
    setCategoryDisplaysStatus({ kind: "loading", message: "" });
    try {
      const { displays } = await fetchProductCategoryDisplays();
      setCategoryDisplays(displays);
      setCategoryDisplaysStatus({ kind: "idle", message: "" });
    } catch (error) {
      setCategoryDisplaysStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : API_CLIENT_UI.FETCH_CATEGORY_DISPLAYS_FALLBACK,
      });
    }
  }, [isCatalogBrowserMainViewActive]);

  useEffect(() => {
    void refreshCategoryDisplays();
  }, [refreshCategoryDisplays]);

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

  const showCatalogProductManageFooter = useMemo(() => {
    const product = catalogProductDetails;
    if (!product || !isAuthorized || !currentUserId) {
      return false;
    }
    if (isAdmin) {
      return true;
    }
    if (isMineMode) {
      return false;
    }
    return isCurrentUserProductSeller(product, currentUserId);
  }, [
    catalogProductDetails,
    isAuthorized,
    currentUserId,
    isAdmin,
    isMineMode,
  ]);

  const catalogDetailsShowAddToCart = useMemo(() => {
    const product = catalogProductDetails;
    if (!product) {
      return false;
    }
    if (isMineMode) {
      return false;
    }
    if (isCurrentUserProductSeller(product, currentUserId)) {
      return false;
    }
    return true;
  }, [catalogProductDetails, isMineMode, currentUserId]);

  useEffect(() => {
    if (!isSessionReady) {
      return;
    }
    if (!isAuthorized) {
      setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
      setInAppNotifications([]);
      setMyProductsCatalogError("");
      setMyProductsTotal(null);
      setMyProductsModerationFilter(MY_PRODUCTS_MODERATION_FILTER_ALL);
      setCatalogFollowingOnly(false);
      if (mainView === "my-profile" || mainView === "notifications") {
        setIsLoginModalOpen(true);
        goToMainView("catalog");
      }
      if (isMyProductsMainView(mainView)) {
        goToMainView("catalog");
      }
    }
  }, [isAuthorized, mainView, goToMainView, isSessionReady]);

  const refreshInAppNotifications = useCallback(async () => {
    if (!isAuthorized) {
      setInAppNotifications([]);
      return;
    }
    try {
      const { inAppNotifications: notifications } = await fetchCurrentUserProfile();
      setInAppNotifications(notifications);
    } catch {
      setInAppNotifications([]);
    }
  }, [isAuthorized]);

  useInAppNotificationsPoll({
    isAuthorized,
    mainView,
    refreshInAppNotifications,
  });

  useEffect(() => {
    if (mainView !== "notifications" || !isAuthorized) {
      setNotificationsPageItems([]);
      return undefined;
    }

    let isCancelled = false;
    void (async () => {
      try {
        const { inAppNotifications: list } = await fetchCurrentUserProfile();
        if (isCancelled) {
          return;
        }
        setNotificationsPageItems(list);
        if (list.length > 0) {
          await markInAppNotificationsRead();
        }
        if (!isCancelled) {
          setInAppNotifications([]);
        }
      } catch {
        if (!isCancelled) {
          setNotificationsPageItems([]);
          setInAppNotifications([]);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [mainView, isAuthorized]);

  useEffect(() => {
    if (mainView !== "my-profile" || !isAuthorized) {
      return undefined;
    }
    let isCancelled = false;
    setMyProfilePage({ phase: "loading", user: null, error: "" });
    void (async () => {
      try {
        const { user } = await fetchCurrentUserProfile();
        if (isCancelled) return;
        setMyProfilePage({ phase: "success", user, error: "" });
      } catch (e) {
        if (isCancelled) return;
        const error =
          e instanceof Error ? e.message : HOME_PAGE_UI.FETCH_MY_PROFILE_FALLBACK;
        setMyProfilePage({ phase: "error", user: null, error });
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [mainView, isAuthorized]);

  useEffect(() => {
    if (!isSessionReady || mainView !== "my-profile") return;
    const requiresAdminTab = activeProfileTab === PROFILE_TAB_ADMIN_ORDERS;
    const requiresStaffTab =
      activeProfileTab === PROFILE_TAB_PRODUCT_MODERATION ||
      activeProfileTab === PROFILE_TAB_PRODUCT_REPORTS ||
      activeProfileTab === PROFILE_TAB_PRODUCT_PROMOTIONS ||
      activeProfileTab === PROFILE_TAB_RAFFLES ||
      activeProfileTab === PROFILE_TAB_DATA_CONFIRMATION_REQUESTS;
    if ((requiresAdminTab && !isAdmin) || (requiresStaffTab && !canModerateProducts)) {
      setMyProfileTab(PROFILE_TAB_OVERVIEW);
    }
  }, [
    mainView,
    activeProfileTab,
    canModerateProducts,
    isAdmin,
    isSessionReady,
    setMyProfileTab,
  ]);

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
    if (!canModerateProducts) {
      setShowHiddenCatalogProducts(false);
    }
  }, [canModerateProducts]);

  const loadCatalogPage = useCallback(
    async (pageNum) => {
      const search = debouncedProductSearchTerm.trim();
      const productCategory = isMineMode
        ? selectedProductCategory ?? undefined
        : isCatalogBrowserMainViewActive
          ? activeCatalogBrowserCategory ?? undefined
          : undefined;
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
        sort: catalogQueryFromUrl.sort,
        includeHidden:
          canModerateProducts && !isMineMode && showHiddenCatalogProducts,
        followingOnly: catalogQueryFromUrl.followingOnly,
        auctionOnly: catalogQueryFromUrl.auctionOnly,
        saleOnly: catalogQueryFromUrl.saleOnly,
      });
    },
    [
      isMineMode,
      isCatalogBrowserMainViewActive,
      activeCatalogBrowserCategory,
      catalogQueryFromUrl,
      debouncedProductSearchTerm,
      selectedProductCategory,
      catalogSort,
      myProductsModerationFilter,
      canModerateProducts,
      showHiddenCatalogProducts,
      catalogFollowingOnly,
      catalogAuctionOnly,
      catalogSaleOnly,
    ],
  );

  useEffect(() => {
    if (!isCatalogProductsView) {
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
    isCatalogProductsView,
    isMineMode,
    debouncedProductSearchTerm,
    selectedProductCategory,
    activeCatalogBrowserCategory,
    catalogQueryFromUrl,
    catalogSort,
    myProductsModerationFilter,
    showHiddenCatalogProducts,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogSaleOnly,
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
    if (!isCatalogProductsView) return undefined;
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
    isCatalogProductsView,
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
    setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
    setIsEditProfileOpen(false);
    setInAppNotifications([]);
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

  const handleNavigateToFullCatalogFromBreadcrumb = () => {
    setMyProductsCatalogError("");
    setSelectedProductCategory(null);
    setIsProductCategoryListOpen(false);
    setCatalogSort(CATALOG_SORT_NEWEST);
    setCatalogFollowingOnly(false);
    setCatalogAuctionOnly(false);
    setCatalogSaleOnly(false);
    navigate(mainViewToPathname("catalog"), { replace: true });
  };

  const handleCatalogMenuClick = useCallback(() => {
    setIsProductCategoryListOpen(false);
    navigate(mainViewToPathname("catalog-browser"), { replace: true });
  }, [navigate]);

  const handleCatalogCategoryGridClick = useCallback(
    (categorySlug) => {
      navigate(
        buildCatalogBrowserLocation({
          sort: CATALOG_SORT_NEWEST,
          category: categorySlug,
          followingOnly: false,
          auctionOnly: false,
          saleOnly: false,
        }),
      );
    },
    [navigate],
  );

  const handleCatalogFeedTileClick = useCallback(
    (tile) => {
      const nextQuery = buildQueryForCatalogFeedTile(tile);
      if (
        nextQuery.followingOnly &&
        !isAuthorized
      ) {
        setIsLoginModalOpen(true);
        return;
      }
      navigate(buildCatalogBrowserLocation(nextQuery));
    },
    [isAuthorized, navigate],
  );

  const handleBackToCatalogLanding = useCallback(() => {
    navigate(mainViewToPathname("catalog-browser"));
  }, [navigate]);

  const handleCategoryDisplaySaved = useCallback((display) => {
    setCategoryDisplays((prev) => {
      const next = prev.filter(
        (row) => row.categorySlug !== display.categorySlug,
      );
      return [...next, display];
    });
  }, []);

  const selectedCategoryLabel = useMemo(() => {
    if (!activeCatalogBrowserCategory) {
      return null;
    }
    return resolveProductCategoryDisplay(
      activeCatalogBrowserCategory,
      new Map(categoryDisplays.map((row) => [row.categorySlug, row])),
    ).label;
  }, [activeCatalogBrowserCategory, categoryDisplays]);

  const activeCatalogFeedLabel = useMemo(() => {
    if (!isCatalogBrowserProductsView || activeCatalogBrowserCategory) {
      return null;
    }
    return resolveActiveCatalogFeedLabel(catalogQueryFromUrl);
  }, [
    isCatalogBrowserProductsView,
    activeCatalogBrowserCategory,
    catalogQueryFromUrl,
  ]);

  const handleSubscriptionsFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_SUBSCRIPTIONS);
  };

  const handleNotificationsClick = () => {
    if (!isAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }
    goToMainView("notifications");
  };

  const handleNotificationsCleared = () => {
    setInAppNotifications([]);
    setNotificationsPageItems([]);
  };

  /**
   * @param {import('../../product-report/model/types.js').UserInAppNotification} item
   */
  const handleInAppNotificationClick = (item) => {
    if (item.kind === IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER && item.actorUserId) {
      handleSellerNameClick(item.actorUserId);
      return;
    }
    if (
      (item.kind === IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT ||
        item.kind ===
          IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT) &&
      item.productId
    ) {
      goToMainView("catalog");
      const inList = products.find(
        (p) => String(p._id) === String(item.productId),
      );
      if (inList) {
        setCatalogProductDetails(inList);
        return;
      }
      void (async () => {
        try {
          const { products: pageProducts } = await fetchCatalogProductsPage({
            page: 1,
            limit: 100,
          });
          const found = pageProducts.find(
            (p) => String(p._id) === String(item.productId),
          );
          if (found) setCatalogProductDetails(found);
        } catch {
          // каталог открыт без модалки
        }
      })();
    }
  };

  /**
   * @param {{
   *   isFollowing: boolean;
   *   followersCount?: number;
   *   followingCount?: number;
   * }} patch
   */
  const handleSellerFollowChange = (patch) => {
    setSellerModal((prev) => {
      if (prev.phase !== "success" || !prev.user) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          isFollowing: patch.isFollowing,
          ...(patch.followersCount != null
            ? { followersCount: patch.followersCount }
            : {}),
          ...(patch.followingCount != null
            ? { followingCount: patch.followingCount }
            : {}),
        },
      };
    });
  };

  const renderSellerFollowAccessory = () => {
    if (sellerModal.phase !== "success" || !sellerModal.user) return null;
    if (
      !currentUserId ||
      String(sellerModal.user._id) === String(currentUserId)
    ) {
      return null;
    }
    return (
      <UserFollowButton
        targetUserId={String(sellerModal.user._id)}
        isFollowing={sellerModal.user.isFollowing === true}
        isAuthorized={isAuthorized}
        isSelf={false}
        onRequestLogin={() => setIsLoginModalOpen(true)}
        onFollowChange={handleSellerFollowChange}
      />
    );
  };

  const handleMyProductsFromProfile = () => {
    if (myProfilePage.phase !== "success" || !myProfilePage.user?._id) return;
    setMyProductsCatalogError("");
    setMyProfileTab(PROFILE_TAB_MY_PRODUCTS);
  };

  const handleMyOrdersFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_MY_ORDERS);
  };

  const handleMySalesFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_MY_SALES);
  };

  const handleAdminOrdersFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_ADMIN_ORDERS);
  };

  const handleProductModerationFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_PRODUCT_MODERATION);
  };

  const handleProductReportsFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_PRODUCT_REPORTS);
  };

  const handleProductPromotionsFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_PRODUCT_PROMOTIONS);
  };

  const handleRafflesFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_RAFFLES);
  };

  const handleToggleRaffleParticipation = async (product, enabled) => {
    if (product._id == null) return;
    const productId = String(product._id);
    setRaffleParticipationPendingProductId(productId);
    try {
      const updated = await setProductRaffleParticipation(productId, enabled);
      setProducts((prev) =>
        prev.map((row) => (String(row._id) === productId ? updated : row)),
      );
      syncProductEditModalState(updated);
      setRaffleRefreshTick((n) => n + 1);
      void refreshFeaturedRaffle();
    } catch (e) {
      setMyProductsCatalogError(
        e instanceof Error ? e.message : API_CLIENT_UI.SET_RAFFLE_PARTICIPATION_FALLBACK,
      );
    } finally {
      setRaffleParticipationPendingProductId(null);
    }
  };

  const handleDataConfirmationQueueFromProfile = () => {
    setMyProfileTab(PROFILE_TAB_DATA_CONFIRMATION_REQUESTS);
  };

  const handleDataConfirmationFromProfile = () => {
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
  const syncProductEditModalState = (product) => {
    const id = String(product._id);
    setProductToEdit((prev) =>
      prev && String(prev._id) === id
        ? { ...product, hasOpenSales: prev.hasOpenSales ?? product.hasOpenSales }
        : prev,
    );
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
      syncCatalogProductState(updated);
      syncProductEditModalState(updated);
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

  /**
   * @param {string} productId
   * @param {boolean} productAuctionEnabled
   */
  const handleSetProductAuction = async (productId, productAuctionEnabled) => {
    try {
      setTogglingAuctionProductId(productId);
      setMyProductsCatalogError("");
      setProductDetailsAdminError("");
      const updated = await patchMyProduct(productId, {
        productAuctionEnabled,
      });
      syncCatalogProductState(updated);
      syncProductEditModalState(updated);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK;
      if (
        catalogProductDetails &&
        String(catalogProductDetails._id) === productId
      ) {
        setProductDetailsAdminError(message);
      } else {
        setMyProductsCatalogError(message);
      }
    } finally {
      setTogglingAuctionProductId(null);
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
      setProductToEdit((prev) =>
        prev && String(prev._id) === productId ? null : prev,
      );
      setCatalogProductDetails((prev) =>
        prev && String(prev._id) === productId ? null : prev,
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
      setProductToEdit((prev) =>
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
        setProductToEdit((prev) =>
          prev && String(prev._id) === productId ? null : prev,
        );
        return;
      }
      syncCatalogProductState(updated);
      syncProductEditModalState(updated);
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

  /**
   * @param {ProductFromApi} product
   */
  const handleOpenPromotionModal = async (product) => {
    setPromotionProduct(product);
    setPromotionModalError("");
    try {
      const tariffs = await fetchProductPromotionTariffs();
      setPromotionTariffs(tariffs);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.FETCH_PRODUCT_PROMOTION_TARIFFS_FALLBACK;
      setPromotionModalError(message);
      setPromotionTariffs([]);
    }
  };

  const handleClosePromotionModal = () => {
    setPromotionProduct(null);
    setPromotionTariffs([]);
    setPromotionModalError("");
  };

  const handleSubmitPromotionRequest = async (tariffCode, paymentMethod) => {
    if (!promotionProduct?._id) {
      return;
    }
    setIsPromotionSubmitPending(true);
    setPromotionModalError("");
    try {
      const { loyaltyPointsBalance, rubBalance: nextRubBalance, message } =
        await requestProductPromotion(String(promotionProduct._id), {
          tariffCode,
          paymentMethod,
        });
      if (loyaltyPointsBalance != null) {
        setLoyaltyPoints(loyaltyPointsBalance);
      }
      if (nextRubBalance != null) {
        setRubBalance(nextRubBalance);
      }
      setMyProductsCatalogNotice(
        message ?? "Заявка на продвижение отправлена.",
      );
      void refreshMyPromotionPendingIds();
      setCatalogRefreshTick((n) => n + 1);
      handleClosePromotionModal();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.REQUEST_PRODUCT_PROMOTION_FALLBACK;
      setPromotionModalError(message);
    } finally {
      setIsPromotionSubmitPending(false);
    }
  };

  const renderCatalogBrowserContent = () => {
    if (isCatalogBrowserLanding) {
      return (
        <CatalogBrowserLanding
          displays={categoryDisplays}
          isAdmin={isAdmin}
          isLoading={categoryDisplaysStatus.kind === "loading"}
          errorMessage={
            categoryDisplaysStatus.kind === "error"
              ? categoryDisplaysStatus.message
              : null
          }
          onFeedTileClick={handleCatalogFeedTileClick}
          onCategoryClick={handleCatalogCategoryGridClick}
          onEditCategoryClick={setEditingCategorySlug}
        />
      );
    }

    const breadcrumbCurrentLabel =
      selectedCategoryLabel ?? activeCatalogFeedLabel;

    return (
      <>
        <div className="catalog-categories-browser__toolbar">
          <nav
            className="catalog-categories-browser__breadcrumb"
            aria-label={HOME_PAGE_UI.BREADCRUMB_CATALOG}
          >
            <button
              type="button"
              className="catalog-categories-browser__breadcrumb-link"
              onClick={handleBackToCatalogLanding}
            >
              {HOME_PAGE_UI.BREADCRUMB_CATALOG}
            </button>
            {breadcrumbCurrentLabel ? (
              <>
                <span className="home-page__breadcrumb-sep" aria-hidden="true">
                  {HOME_PAGE_UI.BREADCRUMB_SEPARATOR}
                </span>
                <span className="catalog-categories-browser__breadcrumb-current">
                  {breadcrumbCurrentLabel}
                </span>
              </>
            ) : null}
          </nav>
          <button
            type="button"
            className="catalog-categories-browser__all-button"
            onClick={handleBackToCatalogLanding}
          >
            {HOME_PAGE_UI.BACK_TO_CATALOG_LANDING}
          </button>
        </div>
        {renderCatalogContent()}
      </>
    );
  };

  const renderCatalogContent = () => {
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
      <>
        {isHomeCatalogMainView && featuredRaffles.length > 0 ? (
          <RaffleFeaturedCarousel
            raffles={featuredRaffles}
            activeIndex={featuredRaffleIndex}
            onActiveIndexChange={setFeaturedRaffleIndex}
            onOpenProducts={(raffleId) => navigate(buildRafflePath(raffleId))}
            getManage={getFeaturedRaffleManage}
          />
        ) : null}
        {isHomeCatalogMainView && userStoriesFeed.showStrip ? (
          <UserStoriesStrip
            rings={userStoriesFeed.rings}
            canPublish={userStoriesFeed.canPublish}
            showStrip={userStoriesFeed.showStrip}
            isAuthorized={isAuthorized}
            currentUserId={currentUserId}
            onRefresh={handleUserStoriesRefresh}
            onOpenProfile={handleSellerNameClick}
          />
        ) : null}
        <HomeCatalogGrid
        products={products}
        selectedProductCategory={
          mainView === "catalog-browser"
            ? activeCatalogBrowserCategory
            : selectedProductCategory
        }
        hasQuery={hasProductSearchQuery}
        isMineMode={isMineMode}
        deletingProductId={deletingProductId}
        onSellerNameClick={handleSellerNameClick}
        onDeleteMyProduct={handleDeleteMyProduct}
        onEditMyProduct={handleOpenEditMyProduct}
        onPromoteMyProduct={handleOpenPromotionModal}
        pendingPromotionProductIds={pendingPromotionProductIds}
        myProductsCatalogError={myProductsCatalogError}
        myProductsCatalogNotice={myProductsCatalogNotice}
        onOpenProductDetails={setCatalogProductDetails}
        onSetMyProductAvailability={handleSetMyProductAvailability}
        onSetMyProductAuction={handleSetProductAuction}
        togglingAvailabilityProductId={togglingAvailabilityProductId}
        togglingAuctionProductId={togglingAuctionProductId}
        isAuthorized={isAuthorized}
        isPremiumUser={isPremiumUser}
        currentUserId={currentUserId}
        onRequestLoginAddToCart={() => setIsLoginModalOpen(true)}
        showAddToCartOnCard={false}
        catalogSentinelRef={catalogSentinelRef}
        catalogHasMore={catalogHasMore}
        isCatalogLoadingMore={isCatalogLoadingMore}
        catalogLoadMoreError={catalogLoadMoreError}
        onRetryCatalogLoadMore={handleRetryCatalogLoadMore}
        myProductsModerationFilter={myProductsModerationFilter}
        catalogFollowingOnly={catalogFollowingOnly}
        catalogAuctionOnly={catalogAuctionOnly}
        catalogSaleOnly={catalogSaleOnly}
        sellerRaffleActive={sellerRaffleActive}
        onToggleRaffleParticipation={handleToggleRaffleParticipation}
        raffleParticipationPendingProductId={raffleParticipationPendingProductId}
      />
      </>
    );
  };

  const renderMainContent = () => {
    if (isRaffleRoute && raffleRouteId) {
      return (
        <RaffleProductsPage
          raffleId={raffleRouteId}
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onRequestLoginAddToCart={() => setIsLoginModalOpen(true)}
          onSellerNameClick={handleSellerNameClick}
          onOpenProductDetails={setCatalogProductDetails}
          onBackToCatalog={() => goToMainView("catalog")}
        />
      );
    }

    const isProfileRoleRestrictedTab =
      mainView === "my-profile" &&
      (activeProfileTab === PROFILE_TAB_ADMIN_ORDERS ||
        activeProfileTab === PROFILE_TAB_PRODUCT_MODERATION ||
        activeProfileTab === PROFILE_TAB_PRODUCT_REPORTS ||
        activeProfileTab === PROFILE_TAB_PRODUCT_PROMOTIONS ||
        activeProfileTab === PROFILE_TAB_RAFFLES ||
        activeProfileTab === PROFILE_TAB_DATA_CONFIRMATION_REQUESTS);

    if (
      isAuthorized &&
      !isSessionReady &&
      (isRoleRestrictedMainView(mainView) || isProfileRoleRestrictedTab)
    ) {
      return (
        <p className="home-page__state">{HOME_PAGE_UI.LOADING_SESSION}</p>
      );
    }

    if (mainView === "my-profile") {
      const profileTabContent = (() => {
        if (activeProfileTab === PROFILE_TAB_MY_PRODUCTS) {
          return renderCatalogContent();
        }
        if (activeProfileTab === PROFILE_TAB_MY_ORDERS) {
          return (
            <MyOrdersPage
              isAuthorized={isAuthorized}
              currentUserId={currentUserId}
              onSellerNameClick={handleSellerNameClick}
              onRequestLogin={() => setIsLoginModalOpen(true)}
            />
          );
        }
        if (activeProfileTab === PROFILE_TAB_MY_SALES) {
          return (
            <MySalesPage
              isAuthorized={isAuthorized}
              currentUserId={currentUserId}
              onSellerNameClick={handleSellerNameClick}
            />
          );
        }
        if (activeProfileTab === PROFILE_TAB_SUBSCRIPTIONS) {
          return (
            <SubscriptionsPage
              isAuthorized={isAuthorized}
              onRequestLogin={() => setIsLoginModalOpen(true)}
              onUserClick={handleSellerNameClick}
            />
          );
        }
        if (activeProfileTab === PROFILE_TAB_ADMIN_ORDERS && isAdmin) {
          return <AdminOrdersPage />;
        }
        if (activeProfileTab === PROFILE_TAB_PRODUCT_MODERATION && canModerateProducts) {
          return (
            <ProductModerationPage
              onSellerNameClick={handleSellerNameClick}
              onQueueChanged={refreshPendingModerationCount}
            />
          );
        }
        if (activeProfileTab === PROFILE_TAB_PRODUCT_REPORTS && canModerateProducts) {
          return (
            <ProductReportsPage
              onSellerNameClick={handleSellerNameClick}
              onProductClick={(product) => setCatalogProductDetails(product)}
              onQueueChanged={() => void refreshPendingProductReportsCount()}
            />
          );
        }
        if (activeProfileTab === PROFILE_TAB_PRODUCT_PROMOTIONS && canModerateProducts) {
          return (
            <ProductPromotionsStaffPage
              onQueueChanged={() => {
                void refreshPendingProductPromotionsCount();
                setCatalogRefreshTick((n) => n + 1);
              }}
            />
          );
        }
        if (activeProfileTab === PROFILE_TAB_RAFFLES && canModerateProducts) {
          return (
            <RafflesStaffPage
              refreshTick={raffleRefreshTick}
              onQueueChanged={() => {
                void refreshPendingRafflesCount();
                setRaffleRefreshTick((n) => n + 1);
                setCatalogRefreshTick((n) => n + 1);
                void refreshFeaturedRaffle();
              }}
              onEditRaffle={(raffle) =>
                setRaffleModal({ mode: "edit", raffle, useStaffApi: true })
              }
            />
          );
        }
        if (
          activeProfileTab === PROFILE_TAB_DATA_CONFIRMATION_REQUESTS &&
          canModerateProducts
        ) {
          return (
            <DataConfirmationRequestsPage
              onApplicantClick={handleSellerNameClick}
              onQueueChanged={() => void refreshPendingDataConfirmationCount()}
            />
          );
        }
        return (
          <RaffleSellerOverview
            refreshTick={raffleRefreshTick}
            onChanged={() => {
              setRaffleRefreshTick((n) => n + 1);
              void refreshFeaturedRaffle();
              void refreshSellerRaffleState();
            }}
            onEditRaffle={(raffle) =>
              setRaffleModal({ mode: "edit", raffle, useStaffApi: false })
            }
          />
        );
      })();

      return (
        <MyProfilePage
          user={myProfilePage.phase === "success" ? myProfilePage.user : null}
          isLoading={myProfilePage.phase === "loading"}
          errorMessage={myProfilePage.phase === "error" ? myProfilePage.error : null}
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
          onProductPromotionsClick={
            canModerateProducts ? handleProductPromotionsFromProfile : undefined
          }
          onRafflesClick={canModerateProducts ? handleRafflesFromProfile : undefined}
          onCreateRaffleClick={
            myProfilePage.phase === "success" &&
            myProfilePage.user?.isUserDataConfirmed === true
              ? () => setRaffleModal({ mode: "create" })
              : undefined
          }
          pendingRafflesCount={pendingRafflesCount}
          onDataConfirmationQueueClick={
            canModerateProducts ? handleDataConfirmationQueueFromProfile : undefined
          }
          onDataConfirmationClick={
            isAuthorized ? handleDataConfirmationFromProfile : undefined
          }
          onSubscriptionsClick={
            isAuthorized ? handleSubscriptionsFromProfile : undefined
          }
          pendingModerationCount={pendingModerationCount}
          pendingProductReportsCount={pendingProductReportsCount}
          pendingProductPromotionsCount={pendingProductPromotionsCount}
          pendingDataConfirmationCount={pendingDataConfirmationCount}
          activeTab={activeProfileTab}
          onTabChange={setMyProfileTab}
          tabContent={profileTabContent}
        />
      );
    }

    if (mainView === "users") {
      return (
        <UsersPage
          key={usersListTick}
          onUserRowClick={handleSellerNameClick}
          isAdminViewer={isAdmin}
        />
      );
    }
    if (mainView === "subscriptions") {
      return (
        <SubscriptionsPage
          isAuthorized={isAuthorized}
          onRequestLogin={() => setIsLoginModalOpen(true)}
          onUserClick={handleSellerNameClick}
        />
      );
    }
    if (mainView === "notifications") {
      if (!isAuthorized) {
        return null;
      }
      return (
        <NotificationsPage
          notifications={notificationsPageItems}
          onNotificationClick={handleInAppNotificationClick}
          onCleared={handleNotificationsCleared}
        />
      );
    }
    if (mainView === "cart") {
      return (
        <CartPage
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onRequestLogin={() => setIsLoginModalOpen(true)}
          onGoToCatalog={() => goToMainView("catalog")}
          onCheckoutSuccess={() => goToMainView("my-orders")}
          onSellerNameClick={handleSellerNameClick}
        />
      );
    }
    if (mainView === "my-orders") {
      return (
        <MyOrdersPage
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onSellerNameClick={handleSellerNameClick}
          onRequestLogin={() => setIsLoginModalOpen(true)}
        />
      );
    }
    if (mainView === "my-sales") {
      return (
        <MySalesPage
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onSellerNameClick={handleSellerNameClick}
        />
      );
    }
    if (mainView === "admin-orders") {
      if (!isAdmin) return null;
      return <AdminOrdersPage />;
    }
    if (mainView === "product-moderation") {
      if (!canModerateProducts) return null;
      return (
        <ProductModerationPage
          onSellerNameClick={handleSellerNameClick}
          onQueueChanged={refreshPendingModerationCount}
        />
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

    if (mainView === "catalog-browser") {
      return renderCatalogBrowserContent();
    }

    return renderCatalogContent();
  };

  return (
    <div className={`home-page ${getHomePageVariantClass()}`}>
      <CartServerSync isAuthorized={isAuthorized} />
      <HomePageHeader
        mainView={mainView}
        isMineMode={isMineMode}
        selectedProductCategory={
          mainView === "catalog-browser"
            ? activeCatalogBrowserCategory
            : selectedProductCategory
        }
        isProductCategoryListOpen={isProductCategoryListOpen}
        onCatalogMenuClick={handleCatalogMenuClick}
        isCatalogMenuActive={isCatalogBrowserLanding}
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
        pendingModerationCount={pendingModerationCount}
        pendingProductReportsCount={pendingProductReportsCount}
        pendingDataConfirmationCount={pendingDataConfirmationCount}
        onMyProfileClick={() => goToMainView("my-profile")}
        onNotificationsClick={handleNotificationsClick}
        unreadNotificationsCount={inAppNotifications.length}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onNavigateToFullCatalogFromBreadcrumb={
          handleNavigateToFullCatalogFromBreadcrumb
        }
        catalogSort={catalogSort}
        onCatalogSortChange={handleCatalogSortChange}
        catalogFollowingOnly={catalogFollowingOnly}
        catalogAuctionOnly={catalogAuctionOnly}
        catalogSaleOnly={catalogSaleOnly}
        onCatalogFollowingOnlyToggle={handleCatalogFollowingOnlyToggle}
        onCatalogAuctionOnlyToggle={handleCatalogAuctionOnlyToggle}
        onCatalogSaleOnlyToggle={handleCatalogSaleOnlyToggle}
        isAdmin={isAdmin}
        canModerateProducts={canModerateProducts}
        showHiddenCatalogProducts={showHiddenCatalogProducts}
        onShowHiddenCatalogProductsToggle={handleShowHiddenCatalogProductsToggle}
        myProductsModerationFilter={myProductsModerationFilter}
        onMyProductsModerationFilterChange={setMyProductsModerationFilter}
      />

      {renderMainContent()}

      <SiteFooter />

      <UserDetailsModal
        isOpen={sellerModal.open}
        onClose={closeSellerModal}
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        isLoading={sellerModal.phase === "loading"}
        errorMessage={sellerModal.phase === "error" ? sellerModal.error : null}
        titleAccessory={renderSellerFollowAccessory()}
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
        allowSelfPremiumToggle={isAdmin}
        allowStaffLoyaltyEdit={canModerateProducts}
        user={myProfilePage.phase === "success" ? myProfilePage.user : null}
        onSaved={(updatedUser) => {
          setMyProfilePage((prev) =>
            prev.phase === "success" && prev.user
              ? { ...prev, user: { ...prev.user, ...updatedUser } }
              : prev,
          );
          if (updatedUser.isPremiumUser !== undefined) {
            setIsPremiumUser(Boolean(updatedUser.isPremiumUser));
          }
          if (updatedUser.userLoyaltyPoints != null) {
            setLoyaltyPoints(Number(updatedUser.userLoyaltyPoints) || 0);
          }
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
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
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
        manageProduct={productToEdit}
        onDeleteProduct={handleDeleteMyProduct}
        onSetProductAvailability={handleSetMyProductAvailability}
        onSetProductAuction={handleSetProductAuction}
        isDeletePending={
          productToEdit?._id != null &&
          deletingProductId === String(productToEdit._id)
        }
        isAvailabilityTogglePending={
          productToEdit?._id != null &&
          togglingAvailabilityProductId === String(productToEdit._id)
        }
        isAuctionTogglePending={
          productToEdit?._id != null &&
          togglingAuctionProductId === String(productToEdit._id)
        }
        manageErrorMessage={myProductsCatalogError || productDetailsAdminError}
        canManageEdit={
          productToEdit != null &&
          (isAdmin || canSellerEditProduct(productToEdit))
        }
        canManageDelete={
          productToEdit != null &&
          (isAdmin || canSellerDeleteProduct(productToEdit))
        }
        canManageToggleVisibility={
          productToEdit != null &&
          (isAdmin || canSellerToggleCatalogVisibility(productToEdit))
        }
        sellerRaffleActive={sellerRaffleActive}
        onToggleRaffleParticipation={handleToggleRaffleParticipation}
        isRaffleParticipationPending={
          productToEdit?._id != null &&
          raffleParticipationPendingProductId === String(productToEdit._id)
        }
      />
      <ProductPromotionModal
        isOpen={promotionProduct != null}
        productName={promotionProduct?.productName ?? ""}
        tariffs={promotionTariffs}
        loyaltyPoints={loyaltyPoints}
        rubBalance={rubBalance}
        errorMessage={promotionModalError}
        isSubmitting={isPromotionSubmitPending}
        onClose={handleClosePromotionModal}
        onSubmit={handleSubmitPromotionRequest}
      />
      <CreateRaffleModal
        isOpen={raffleModal != null}
        mode={raffleModal?.mode ?? "create"}
        raffleToEdit={
          raffleModal?.mode === "edit" ? raffleModal.raffle : null
        }
        useStaffApi={raffleModal?.mode === "edit" ? raffleModal.useStaffApi : false}
        onClose={() => setRaffleModal(null)}
        onSuccess={() => {
          setRaffleRefreshTick((n) => n + 1);
          void refreshFeaturedRaffle();
          void refreshSellerRaffleState();
          void refreshPendingRafflesCount();
          if (raffleModal?.mode === "create") {
            setMyProductsCatalogNotice("Розыгрыш отправлен на модерацию.");
          }
        }}
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
          showCatalogProductManageFooter && catalogProductDetails ? (
            <ProductDetailsAdminFooter
              onEdit={handleAdminOpenEditProductFromDetails}
              canEdit={
                isAdmin || canSellerEditProduct(catalogProductDetails)
              }
              isDeletePending={
                deletingProductId === String(catalogProductDetails._id)
              }
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
      <EditProductCategoryDisplayModal
        isOpen={editingCategorySlug != null}
        categorySlug={editingCategorySlug}
        displays={categoryDisplays}
        onClose={() => setEditingCategorySlug(null)}
        onSaved={handleCategoryDisplaySaved}
      />
    </div>
  );
}
