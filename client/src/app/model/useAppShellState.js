import { useCallback, useMemo, useState } from "react";

import { useAuthSession } from "../../entities/user/model/useAuthSession.js";
import { useMyProductsTotalQuery } from "../../entities/product/model/useMyProductsTotalQuery.js";
import { USER_ROLE_ADMIN } from "../../entities/user/model/userConstants.js";
import { MY_PRODUCTS_MODERATION_FILTER_ALL } from "../../entities/product/model/productConstants.js";
import { parseCatalogQueryFromSearchParams } from "../../entities/product/lib/catalogCatalogQuery.js";
import { isHomeCatalogFeedVisible } from "../../entities/product/lib/isHomeCatalogFeedVisible.js";
import { useViewerRegionController } from "../../entities/region/model/useViewerRegionController.js";
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from "../../shared/lib/authPaths.js";
import { useCatalogMainView } from "../../widgets/app-shell/model/useCatalogMainView.js";
import { useHomeEmailVerifiedRedirect } from "../../widgets/app-shell/model/useHomeEmailVerifiedRedirect.js";
import { useHomeFeaturedContent } from "../../widgets/app-shell/model/useHomeFeaturedContent.js";
import { useAppShellNavigation } from "../../widgets/app-shell/model/useAppShellNavigation.js";
import { useHomeQueryRefreshers } from "../../widgets/app-shell/model/useHomeQueryRefreshers.js";
import { useHomeRouteGuards } from "../../widgets/app-shell/model/useHomeRouteGuards.js";
import { useHomeSellerAccess } from "../../widgets/app-shell/model/useHomeSellerAccess.js";
import { useHomeSellerModal } from "../../widgets/app-shell/model/useHomeSellerModal.jsx";
import { useStaffBadgeQueries } from "../../widgets/app-shell/model/useStaffBadgeQueries.js";
import { useShellUiState } from "../../widgets/app-shell/model/useShellUiState.js";
import {
  EMPTY_MY_PROFILE_PAGE,
  readInitialCatalogQuery,
} from "../../widgets/app-shell/lib/catalogShellConstants.js";

/**
 * @param {import('react-router-dom').Location} location
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @returns {Partial<import('../../widgets/app-shell/model/appShellStateTypes.js').AppShellStateValue>}
 */
export function useAppShellState(location, navigate) {
  const navigation = useAppShellNavigation(location, navigate);
  const catalogView = useCatalogMainView(location);
  const shellUi = useShellUiState();
  const {
    setIsLoginModalOpen: setLoginModalOpenState,
    setIsRegisterModalOpen: setRegisterModalOpenState,
  } = shellUi;

  const setIsLoginModalOpen = useCallback(
    (open) => {
      if (open) {
        navigate(AUTH_LOGIN_PATH);
        return;
      }
      setLoginModalOpenState(false);
    },
    [navigate, setLoginModalOpenState],
  );

  const setIsRegisterModalOpen = useCallback(
    (open) => {
      if (open) {
        navigate(AUTH_REGISTER_PATH);
        return;
      }
      setRegisterModalOpenState(false);
    },
    [navigate, setRegisterModalOpenState],
  );

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

  const viewerRegion = useViewerRegionController(authUser?.userRegionCode);

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
    navigate,
    goToMainView: navigation.goToMainView,
  });

  const queryRefreshers = useHomeQueryRefreshers();

  const catalogQueryFromUrl = useMemo(
    () => parseCatalogQueryFromSearchParams(new URLSearchParams(location.search)),
    [location.search],
  );
  const showHomeCatalogFeed = isHomeCatalogFeedVisible({
    isHomeCatalogMainView: catalogView.isHomeCatalogMainView,
    hasProductSearchQuery: shellUi.submittedProductSearchTerm.trim() !== "",
    selectedProductCategory: catalogQueryFromUrl.category,
    selectedCategoryId: catalogQueryFromUrl.categoryId,
    sellerPersonalCategoryId: catalogQueryFromUrl.sellerPersonalCategoryId,
    catalogFollowingOnly: catalogQueryFromUrl.followingOnly,
    catalogAuctionOnly: catalogQueryFromUrl.auctionOnly,
    catalogInstallmentOnly: catalogQueryFromUrl.installmentOnly,
    catalogSaleOnly: catalogQueryFromUrl.saleOnly,
    catalogNear: catalogQueryFromUrl.near,
  });

  const featuredContent = useHomeFeaturedContent({
    isHomeCatalogMainView: showHomeCatalogFeed,
    isAuthorized,
    currentUserId,
    canModerateProducts,
    mainView: navigation.mainView,
    viewerRegionCode: viewerRegion.viewerRegionCode,
    onCatalogError: shellUi.onCatalogError,
    setRaffleModal: shellUi.setRaffleModal,
    refreshPendingRafflesCount: staffBadges.refreshPendingRafflesCount,
  });

  const isCatalogShellView = catalogView.isCatalogRoute || navigation.isMyProductsRoute;

  return {
    ...navigation,
    ...catalogView,
    isCatalogShellView,
    showHomeCatalogFeed,
    ...shellUi,
    setIsLoginModalOpen,
    setIsRegisterModalOpen,
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
    ...viewerRegion,
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
