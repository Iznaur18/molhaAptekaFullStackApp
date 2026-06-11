import { useEffect } from "react";

import { MY_PRODUCTS_MODERATION_FILTER_ALL } from "../../../entities/product/model/productConstants.js";
import { isRoleRestrictedMainView } from "../../../shared/lib/homeMainViewPaths.js";
import { isProfileTabMainView } from "../../my-profile/lib/profileTabToMainView.js";
import { EMPTY_MY_PROFILE_PAGE } from "../lib/catalogShellConstants.js";

/**
 * @param {object} params
 */
export const useHomeMyProfileSession = ({
  isAuthorized,
  isSessionReady,
  mainView,
  isAdmin,
  canModerateProducts,
  goToMainView,
  setMyProfilePage,
  setIsLoginModalOpen,
  setMyProductsCatalogError,
  setMyProductsModerationFilter,
  resetCatalogFollowingOnLogout,
  clearInAppNotifications,
  authUser,
}) => {
  useEffect(() => {
    if (!isSessionReady) {
      return;
    }
    if (!isAuthorized) {
      setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
      clearInAppNotifications();
      setMyProductsCatalogError("");
      setMyProductsModerationFilter(MY_PRODUCTS_MODERATION_FILTER_ALL);
      resetCatalogFollowingOnLogout();
      if (isProfileTabMainView(mainView) || mainView === "notifications") {
        setIsLoginModalOpen(true);
        goToMainView("catalog");
      }
    }
  }, [
    isAuthorized,
    mainView,
    goToMainView,
    isSessionReady,
    resetCatalogFollowingOnLogout,
    setIsLoginModalOpen,
    setMyProductsCatalogError,
    setMyProductsModerationFilter,
    clearInAppNotifications,
    setMyProfilePage,
  ]);

  useEffect(() => {
    if (!isProfileTabMainView(mainView)) {
      return undefined;
    }

    if (!isAuthorized) {
      setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
      return undefined;
    }

    if (authUser) {
      setMyProfilePage({ phase: "success", user: authUser, error: "" });
      return undefined;
    }

    setMyProfilePage({ phase: "loading", user: null, error: "" });
    return undefined;
  }, [authUser, isAuthorized, mainView, setMyProfilePage]);

  useEffect(() => {
    if (!isSessionReady || !isRoleRestrictedMainView(mainView)) {
      return;
    }
    const requiresAdmin =
      mainView === "admin-orders" ||
      mainView === "search-synonyms-admin" ||
      mainView === "category-tree-admin" ||
      mainView === "app-intro-admin" ||
      mainView === "popular-products-admin";
    if ((requiresAdmin && !isAdmin) || (!requiresAdmin && !canModerateProducts)) {
      goToMainView("catalog");
    }
  }, [mainView, canModerateProducts, isAdmin, isSessionReady, goToMainView]);
};
