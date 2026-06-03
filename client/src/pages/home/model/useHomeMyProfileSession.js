import { useEffect } from "react";

import { fetchMyProductsPage } from "../../../entities/product/api/fetchMyProducts.js";
import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import {
  MY_PRODUCTS_MODERATION_FILTER_ALL,
} from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { isMyProductsMainView } from "../../../shared/lib/homeMainViewPaths.js";
import {
  PROFILE_TAB_ADMIN_ORDERS,
  PROFILE_TAB_DATA_CONFIRMATION_REQUESTS,
  PROFILE_TAB_INSTALLMENT_DISPUTES,
  PROFILE_TAB_INSTALLMENT_MODERATION,
  PROFILE_TAB_OVERVIEW,
  PROFILE_TAB_PRODUCT_MODERATION,
  PROFILE_TAB_PRODUCT_PROMOTIONS,
  PROFILE_TAB_PRODUCT_REPORTS,
  PROFILE_TAB_RAFFLES,
} from "../../my-profile/lib/profileTabs.js";
import { EMPTY_MY_PROFILE_PAGE } from "../lib/homePageConstants.js";

/**
 * @param {object} params
 */
export const useHomeMyProfileSession = ({
  isAuthorized,
  isSessionReady,
  mainView,
  activeProfileTab,
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
  setMyProfileTab,
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
        const error =
          e instanceof Error ? e.message : HOME_PAGE_UI.FETCH_MY_PROFILE_FALLBACK;
        setMyProfilePage({ phase: "error", user: null, error });
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [mainView, isAuthorized, setMyProfilePage]);

  useEffect(() => {
    if (!isSessionReady || mainView !== "my-profile") {
      return;
    }
    const requiresAdminTab = activeProfileTab === PROFILE_TAB_ADMIN_ORDERS;
    const requiresStaffTab =
      activeProfileTab === PROFILE_TAB_PRODUCT_MODERATION ||
      activeProfileTab === PROFILE_TAB_PRODUCT_REPORTS ||
      activeProfileTab === PROFILE_TAB_PRODUCT_PROMOTIONS ||
      activeProfileTab === PROFILE_TAB_RAFFLES ||
      activeProfileTab === PROFILE_TAB_DATA_CONFIRMATION_REQUESTS ||
      activeProfileTab === PROFILE_TAB_INSTALLMENT_MODERATION ||
      activeProfileTab === PROFILE_TAB_INSTALLMENT_DISPUTES;
    if (
      (requiresAdminTab && !isAdmin) ||
      (requiresStaffTab && !canModerateProducts)
    ) {
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
