import { useMemo, useState } from "react";

import { useAuthSession } from "../../entities/user/model/useAuthSession.js";
import { useMyProductsTotalQuery } from "../../entities/product/model/useMyProductsTotalQuery.js";
import { USER_ROLE_ADMIN } from "../../entities/user/model/userConstants.js";
import { MY_PRODUCTS_MODERATION_FILTER_ALL } from "../../entities/product/model/productConstants.js";
import { useCatalogMainView } from "../../pages/catalog/model/useCatalogMainView.js";
import { useHomeEmailVerifiedRedirect } from "../../pages/home/model/useHomeEmailVerifiedRedirect.js";
import { useHomeFeaturedContent } from "../../pages/home/model/useHomeFeaturedContent.js";
import { useAppShellNavigation } from "../../pages/home/model/useAppShellNavigation.js";
import { useHomeQueryRefreshers } from "../../pages/home/model/useHomeQueryRefreshers.js";
import { useHomeRouteGuards } from "../../pages/home/model/useHomeRouteGuards.js";
import { useHomeSellerAccess } from "../../pages/home/model/useHomeSellerAccess.js";
import { useHomeSellerModal } from "../../pages/home/model/useHomeSellerModal.jsx";
import { useStaffBadgeQueries } from "../../pages/home/model/useStaffBadgeQueries.js";
import { useShellUiState } from "../../pages/home/model/useShellUiState.js";
import {
  EMPTY_MY_PROFILE_PAGE,
  readInitialCatalogQuery,
} from "../../pages/home/lib/catalogShellConstants.js";

/**
 * @param {import('react-router-dom').Location} location
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @returns {Partial<import('./appShellStateTypes.js').AppShellStateValue>}
 */
export function useAppShellState(location, navigate) {
  const navigation = useAppShellNavigation(location, navigate);
  const catalogView = useCatalogMainView(location);
  const shellUi = useShellUiState();
  const authSession = useAuthSession();

  const {
    isAuthorized,
    isAuthReady,
    setIsAuthorized,
    isSessionReady,
    currentUserId,
    currentUserRole,
    isPremiumUser,
    isEmailVerified,
    currentUserEmail,
    loyaltyPoints,
    loyaltyPointsReserved,
    setLoyaltyPoints,
    setLoyaltyPointsReserved,
    setCurrentUserId,
    setIsPremiumUser,
    setIsEmailVerified,
    inAppNotifications,
    invalidateAuthMe,
    patchAuthMeNotifications,
    clearAuthSession,
    user: authUser,
  } = authSession;

  const initialCatalogQuery = useMemo(() => readInitialCatalogQuery(), []);
  const [myProfilePage, setMyProfilePage] = useState(EMPTY_MY_PROFILE_PAGE);
  const [myProductsModerationFilter, setMyProductsModerationFilter] = useState(
    MY_PRODUCTS_MODERATION_FILTER_ALL,
  );

  const isAdminRole = currentUserRole === USER_ROLE_ADMIN;
  const { myProductsTotal } = useMyProductsTotalQuery({
    enabled: isAuthorized && !isAdminRole,
  });

  const emailVerificationRedirect = useHomeEmailVerifiedRedirect({
    location,
    navigate,
    isAuthorized,
    invalidateAuthMe,
  });

  const { isAdmin, canModerateProducts, sellerProductsLimit, isAtSellerProductsLimit } =
    useHomeSellerAccess({
      currentUserRole,
      isPremiumUser,
      myProductsTotal,
    });

  useHomeRouteGuards({
    location,
    navigate,
    mainView: navigation.mainView,
    goToMainView: navigation.goToMainView,
    isSessionReady,
    isAdmin,
    canModerateProducts,
  });

  const staffBadges = useStaffBadgeQueries({
    isAuthorized,
    canModerateProducts,
    mainView: navigation.mainView,
  });

  const sellerModalState = useHomeSellerModal({
    currentUserId,
    isAuthorized,
    navigate,
    goToMainView: navigation.goToMainView,
    setIsLoginModalOpen: shellUi.setIsLoginModalOpen,
    setIsAdminEditUserOpen: shellUi.setIsAdminEditUserOpen,
    setIsAdminDeleteUserOpen: shellUi.setIsAdminDeleteUserOpen,
  });

  const queryRefreshers = useHomeQueryRefreshers();

  const featuredContent = useHomeFeaturedContent({
    isHomeCatalogMainView: catalogView.isHomeCatalogMainView,
    isAuthorized,
    currentUserId,
    canModerateProducts,
    mainView: navigation.mainView,
    onCatalogError: shellUi.onCatalogError,
    setRaffleModal: shellUi.setRaffleModal,
    refreshPendingRafflesCount: staffBadges.refreshPendingRafflesCount,
  });

  const isCatalogShellView = catalogView.isCatalogRoute || navigation.isMyProductsRoute;

  return {
    ...navigation,
    ...catalogView,
    isCatalogShellView,
    ...shellUi,
    initialCatalogQuery,
    myProfilePage,
    setMyProfilePage,
    myProductsModerationFilter,
    setMyProductsModerationFilter,
    myProductsTotal,
    isAuthorized,
    isAuthReady,
    setIsAuthorized,
    currentUserId,
    currentUserRole,
    isPremiumUser,
    isEmailVerified,
    currentUserEmail,
    loyaltyPoints,
    loyaltyPointsReserved,
    setLoyaltyPoints,
    setLoyaltyPointsReserved,
    setCurrentUserId,
    setIsPremiumUser,
    setIsEmailVerified,
    isSessionReady,
    authUser,
    isAdmin,
    canModerateProducts,
    sellerProductsLimit,
    isAtSellerProductsLimit,
    ...staffBadges,
    ...sellerModalState,
    ...featuredContent,
    ...queryRefreshers,
    inAppNotifications,
    invalidateAuthMe,
    patchAuthMeNotifications,
    clearAuthSession,
    ...emailVerificationRedirect,
  };
}
