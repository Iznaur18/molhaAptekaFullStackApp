import { useEffect } from "react";

import {
  pathnameToMainView,
  isRoleRestrictedMainView,
} from "../../../shared/lib/homeMainViewPaths.js";
import { isAuthPagePath } from "../../../shared/lib/authPaths.js";
import { isProductDetailsPath } from "../../../shared/lib/productDetailsPaths.js";
import { isInfoPagePath } from "../../../shared/lib/infoPagePaths.js";
import { isRaffleProductsPath } from "../../../shared/lib/rafflePaths.js";
import { isSellerProductsPath } from "../../../shared/lib/sellerPaths.js";
import { isUserProfileSpaPath } from "../../../shared/lib/userProfilePaths.js";

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

    if (isUserProfileSpaPath(location.pathname)) {
      return undefined;
    }

    if (isInfoPagePath(location.pathname)) {
      return undefined;
    }

    if (isAuthPagePath(location.pathname)) {
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
