import { useEffect } from "react";

import { fetchMyProductsPage } from "../../../entities/product/api/fetchMyProducts.js";
import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { MY_PRODUCTS_MODERATION_FILTER_ALL } from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  isMyProductsMainView,
  isRoleRestrictedMainView,
} from "../../../shared/lib/homeMainViewPaths.js";
import { EMPTY_MY_PROFILE_PAGE } from "../lib/homePageConstants.js";

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
  setMyProductsTotal,
  setMyProductsModerationFilter,
  resetCatalogFollowingOnLogout,
  clearInAppNotifications,
  setIsAuthorized,
}) => {
  useEffect(() => {
    if (!isSessionReady) {
      return;
    }
    if (!isAuthorized) {
      setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
      clearInAppNotifications();
      setMyProductsCatalogError("");
      setMyProductsTotal(null);
      setMyProductsModerationFilter(MY_PRODUCTS_MODERATION_FILTER_ALL);
      resetCatalogFollowingOnLogout();
      if (mainView === "my-profile" || mainView === "notifications") {
        setIsLoginModalOpen(true);
        goToMainView("catalog");
      }
      if (isMyProductsMainView(mainView)) {
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
    setMyProductsTotal,
    clearInAppNotifications,
    setMyProfilePage,
  ]);

  useEffect(() => {
    if (mainView !== "my-profile" || !isAuthorized) {
      return undefined;
    }
    let isCancelled = false;
    setMyProfilePage({ phase: "loading", user: null, error: "" });
    void (async () => {
      try {
        const { user } = await fetchCurrentUserProfile();
        if (isCancelled) {
          return;
        }
        setMyProfilePage({ phase: "success", user, error: "" });
      } catch (e) {
        if (isCancelled) {
          return;
        }
        if (isAuthSessionError(e)) {
          setIsAuthorized(false);
          setMyProfilePage(EMPTY_MY_PROFILE_PAGE);
          setIsLoginModalOpen(true);
          goToMainView("catalog");
          return;
        }
        const error =
          e instanceof Error ? e.message : HOME_PAGE_UI.FETCH_MY_PROFILE_FALLBACK;
        setMyProfilePage({ phase: "error", user: null, error });
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [
    mainView,
    isAuthorized,
    setMyProfilePage,
    setIsAuthorized,
    setIsLoginModalOpen,
    goToMainView,
  ]);

  useEffect(() => {
    if (!isSessionReady || !isRoleRestrictedMainView(mainView)) {
      return;
    }
    const requiresAdmin =
      mainView === "admin-orders" ||
      mainView === "search-synonyms-admin" ||
      mainView === "category-tree-admin";
    if ((requiresAdmin && !isAdmin) || (!requiresAdmin && !canModerateProducts)) {
      goToMainView("catalog");
    }
  }, [mainView, canModerateProducts, isAdmin, isSessionReady, goToMainView]);

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
  }, [isAuthorized, isAdmin, setMyProductsTotal]);
};
