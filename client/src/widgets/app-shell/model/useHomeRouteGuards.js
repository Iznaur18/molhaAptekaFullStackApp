import { useEffect } from "react";

import {
  pathnameToMainView,
  isRoleRestrictedMainView,
} from "../../../shared/lib/homeMainViewPaths.js";
import { isProductDetailsPath } from "../../../shared/lib/productDetailsPaths.js";
import { isRaffleProductsPath } from "../../../shared/lib/rafflePaths.js";
import { isSellerProductsPath } from "../../../shared/lib/sellerPaths.js";

/**
 * @param {object} params
 */
export const useHomeRouteGuards = ({
  location,
  navigate,
  mainView,
  goToMainView,
  isSessionReady,
  isAdmin,
  canModerateProducts,
}) => {
  useEffect(() => {
    if (pathnameToMainView(location.pathname) !== null) {
      return undefined;
    }

    if (isRaffleProductsPath(location.pathname)) {
      return undefined;
    }

    if (isSellerProductsPath(location.pathname)) {
      return undefined;
    }

    if (isProductDetailsPath(location.pathname)) {
      return undefined;
    }

    navigate("/", { replace: true });

    return undefined;
  }, [location.pathname, navigate]);

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
  }, [mainView, isAdmin, canModerateProducts, goToMainView, isSessionReady]);
};
