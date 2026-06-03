import { useEffect } from "react";

import { pathnameToMainView } from "../../../shared/lib/homeMainViewPaths.js";
import { isRaffleProductsPath } from "../../../shared/lib/rafflePaths.js";

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
    navigate("/", { replace: true });
    return undefined;
  }, [location.pathname, navigate]);

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
      return;
    }
    if (mainView === "installment-moderation" && !canModerateProducts) {
      goToMainView("catalog");
      return;
    }
    if (mainView === "installment-disputes" && !canModerateProducts) {
      goToMainView("catalog");
    }
  }, [mainView, isAdmin, canModerateProducts, goToMainView, isSessionReady]);
};
