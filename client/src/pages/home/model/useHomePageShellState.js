import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthBootstrap } from "./useAuthBootstrap.js";
import { useCurrentUserSession } from "./useCurrentUserSession.js";
import { useHomeEmailVerifiedRedirect } from "./useHomeEmailVerifiedRedirect.js";
import { useHomeFeaturedContent } from "./useHomeFeaturedContent.js";
import { useCatalogMainView } from "../../catalog/model/useCatalogMainView.js";
import { useAppShellNavigation } from "./useAppShellNavigation.js";
import { useHomeRouteGuards } from "./useHomeRouteGuards.js";
import { useHomeSellerAccess } from "./useHomeSellerAccess.js";
import { useHomeSellerModal } from "./useHomeSellerModal.jsx";
import { useHomeStaffBadgeCounts } from "./useHomeStaffBadgeCounts.js";
import {
  EMPTY_MY_PROFILE_PAGE,
  readInitialCatalogQuery,
} from "../lib/homePageConstants.js";

import { MY_PRODUCTS_MODERATION_FILTER_ALL } from "../../../entities/product/model/productConstants.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {import('react-router-dom').Location} location
 * @param {import('react-router-dom').NavigateFunction} navigate
 */
export function useHomePageShellState(location, navigate) {
  const {
    mainView,
    goToMainView,
    activeProfileTab,
    raffleRouteId,
    isRaffleRoute,
    sellerRouteId,
    isSellerRoute,
    isMyProductsRoute,
    setMyProfileTab,
  } = useAppShellNavigation(location, navigate);

  const {
    catalogMainView,
    isCatalogRoute,
    isHomeCatalogMainView,
    isCatalogBrowserMainViewActive,
  } = useCatalogMainView(location);

  const isCatalogShellView = isCatalogRoute || isMyProductsRoute;

  /** @type {[ProductFromApi[], import('react').Dispatch<import('react').SetStateAction<ProductFromApi[]>>]} */
  const [products, setProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [{ isAuthorized, isAuthReady }, setIsAuthorized] = useAuthBootstrap();
  const [catalogStatus, setCatalogStatus] = useState({ kind: "loading" });
  const [myProfilePage, setMyProfilePage] = useState(EMPTY_MY_PROFILE_PAGE);
  const [isProductCategoryListOpen, setIsProductCategoryListOpen] = useState(false);
  const [editingFeedTileKey, setEditingFeedTileKey] = useState(
    /** @type {string | null} */ (null),
  );
  const [editingCategorySlug, setEditingCategorySlug] = useState(
    /** @type {import('../../../entities/product/model/types.js').ProductCategory | null} */ (
      null
    ),
  );
  const initialCatalogQuery = useMemo(() => readInitialCatalogQuery(), []);
  const [myProductsModerationFilter, setMyProductsModerationFilter] = useState(
    MY_PRODUCTS_MODERATION_FILTER_ALL,
  );
  const [myProductsCatalogError, setMyProductsCatalogError] = useState("");
  const [myProductsCatalogNotice, setMyProductsCatalogNotice] = useState("");
  const [staffActionNotice, setStaffActionNotice] = useState("");

  useEffect(() => {
    if (!staffActionNotice) {
      return undefined;
    }
    const timerId = window.setTimeout(() => setStaffActionNotice(""), 4000);
    return () => window.clearTimeout(timerId);
  }, [staffActionNotice]);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [togglingAvailabilityProductId, setTogglingAvailabilityProductId] =
    useState(null);
  const [togglingAuctionProductId, setTogglingAuctionProductId] = useState(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isSellerProductsLimitModalOpen, setIsSellerProductsLimitModalOpen] =
    useState(false);
  /** @type {[ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<ProductFromApi | null>>]} */
  const [productToEdit, setProductToEdit] = useState(null);
  const [usersListTick, setUsersListTick] = useState(0);
  const [catalogRefreshTick, setCatalogRefreshTick] = useState(0);

  const {
    currentUserId,
    currentUserRole,
    isPremiumUser,
    isEmailVerified,
    loyaltyPoints,
    loyaltyPointsReserved,
    setLoyaltyPoints,
    setLoyaltyPointsReserved,
    setCurrentUserId,
    setIsPremiumUser,
    setIsEmailVerified,
    isSessionReady,
  } = useCurrentUserSession(isAuthorized, isAuthReady);

  const emailVerificationRedirect = useHomeEmailVerifiedRedirect({
    location,
    navigate,
    isAuthorized,
    setIsEmailVerified,
  });

  const [myProductsTotal, setMyProductsTotal] = useState(
    /** @type {number | null} */ (null),
  );

  const { isAdmin, canModerateProducts, sellerProductsLimit, isAtSellerProductsLimit } =
    useHomeSellerAccess({
      currentUserRole,
      isPremiumUser,
      myProductsTotal,
    });

  useHomeRouteGuards({
    location,
    navigate,
    mainView,
    goToMainView,
    isSessionReady,
    isAdmin,
    canModerateProducts,
  });

  const staffBadges = useHomeStaffBadgeCounts({
    isAuthorized,
    canModerateProducts,
    mainView,
  });

  const [isAdminEditUserOpen, setIsAdminEditUserOpen] = useState(false);
  const [isAdminDeleteUserOpen, setIsAdminDeleteUserOpen] = useState(false);

  const sellerModalState = useHomeSellerModal({
    currentUserId,
    isAuthorized,
    navigate,
    goToMainView,
    setIsLoginModalOpen,
    setIsAdminEditUserOpen,
    setIsAdminDeleteUserOpen,
  });

  /** @type {[ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<ProductFromApi | null>>]} */
  const [catalogProductDetails, setCatalogProductDetails] = useState(null);
  const [productDetailsAdminError, setProductDetailsAdminError] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [raffleParticipationPendingProductId, setRaffleParticipationPendingProductId] =
    useState(null);
  const [raffleModal, setRaffleModal] = useState(
    /** @type {{ mode: 'create' } | { mode: 'edit', raffle: import('../../../entities/raffle/model/types.js').RaffleFromApi, useStaffApi: boolean } | null} */ (
      null
    ),
  );
  const [raffleRefreshTick, setRaffleRefreshTick] = useState(0);

  const onCatalogError = useCallback((message) => {
    setCatalogStatus({ kind: "error", message });
  }, []);

  const featuredContent = useHomeFeaturedContent({
    isHomeCatalogMainView,
    isAuthorized,
    currentUserId,
    canModerateProducts,
    catalogRefreshTick,
    raffleRefreshTick,
    mainView,
    activeProfileTab,
    onCatalogError,
    setRaffleModal,
    setRaffleRefreshTick,
    refreshPendingRafflesCount: staffBadges.refreshPendingRafflesCount,
  });

  const [isDataConfirmationModalOpen, setIsDataConfirmationModalOpen] = useState(false);
  const [dataConfirmationStatusRefreshTick, setDataConfirmationStatusRefreshTick] =
    useState(0);
  const [isReportProductModalOpen, setIsReportProductModalOpen] = useState(false);
  const [promotionProduct, setPromotionProduct] = useState(
    /** @type {ProductFromApi | null} */ (null),
  );
  const [promotionTariffs, setPromotionTariffs] = useState(
    /** @type {Array<{ code: string; title: string; durationHours: number; priceRub: number }>} */ ([]),
  );
  const [promotionModalError, setPromotionModalError] = useState("");
  const [isPromotionSubmitPending, setIsPromotionSubmitPending] = useState(false);

  return {
    mainView,
    catalogMainView,
    goToMainView,
    activeProfileTab,
    raffleRouteId,
    isRaffleRoute,
    sellerRouteId,
    isSellerRoute,
    isMyProductsRoute,
    isCatalogRoute,
    isHomeCatalogMainView,
    isCatalogBrowserMainViewActive,
    isCatalogShellView,
    setMyProfileTab,
    products,
    setProducts,
    productSearchTerm,
    setProductSearchTerm,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    isAuthorized,
    isAuthReady,
    setIsAuthorized,
    catalogStatus,
    setCatalogStatus,
    myProfilePage,
    setMyProfilePage,
    isProductCategoryListOpen,
    setIsProductCategoryListOpen,
    editingFeedTileKey,
    setEditingFeedTileKey,
    editingCategorySlug,
    setEditingCategorySlug,
    initialCatalogQuery,
    myProductsModerationFilter,
    setMyProductsModerationFilter,
    myProductsCatalogError,
    setMyProductsCatalogError,
    myProductsCatalogNotice,
    setMyProductsCatalogNotice,
    staffActionNotice,
    setStaffActionNotice,
    deletingProductId,
    setDeletingProductId,
    togglingAvailabilityProductId,
    setTogglingAvailabilityProductId,
    togglingAuctionProductId,
    setTogglingAuctionProductId,
    isCreateProductModalOpen,
    setIsCreateProductModalOpen,
    isSellerProductsLimitModalOpen,
    setIsSellerProductsLimitModalOpen,
    productToEdit,
    setProductToEdit,
    usersListTick,
    setUsersListTick,
    catalogRefreshTick,
    setCatalogRefreshTick,
    currentUserId,
    currentUserRole,
    isPremiumUser,
    isEmailVerified,
    loyaltyPoints,
    loyaltyPointsReserved,
    setLoyaltyPoints,
    setLoyaltyPointsReserved,
    setCurrentUserId,
    setIsPremiumUser,
    setIsEmailVerified,
    isSessionReady,
    myProductsTotal,
    setMyProductsTotal,
    isAdmin,
    canModerateProducts,
    sellerProductsLimit,
    isAtSellerProductsLimit,
    ...staffBadges,
    isAdminEditUserOpen,
    setIsAdminEditUserOpen,
    isAdminDeleteUserOpen,
    setIsAdminDeleteUserOpen,
    ...sellerModalState,
    catalogProductDetails,
    setCatalogProductDetails,
    productDetailsAdminError,
    setProductDetailsAdminError,
    isEditProfileOpen,
    setIsEditProfileOpen,
    raffleParticipationPendingProductId,
    setRaffleParticipationPendingProductId,
    raffleModal,
    setRaffleModal,
    raffleRefreshTick,
    setRaffleRefreshTick,
    onCatalogError,
    ...featuredContent,
    isDataConfirmationModalOpen,
    setIsDataConfirmationModalOpen,
    dataConfirmationStatusRefreshTick,
    setDataConfirmationStatusRefreshTick,
    isReportProductModalOpen,
    setIsReportProductModalOpen,
    promotionProduct,
    setPromotionProduct,
    promotionTariffs,
    setPromotionTariffs,
    promotionModalError,
    setPromotionModalError,
    isPromotionSubmitPending,
    setIsPromotionSubmitPending,
    ...emailVerificationRedirect,
  };
}
