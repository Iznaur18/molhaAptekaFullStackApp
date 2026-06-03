import { useCallback, useMemo } from "react";

import {
  normalizeProfileTab,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_OVERVIEW,
} from "../../my-profile/lib/profileTabs.js";
import {
  isCatalogBrowserMainView,
  isMyProductsMainView,
  mainViewToPathname,
  pathnameToMainView,
} from "../../../shared/lib/homeMainViewPaths.js";
import { parseRaffleIdFromPathname } from "../../../shared/lib/rafflePaths.js";

/** @typedef {'catalog' | 'catalog-browser' | 'my-profile' | 'my-products' | 'users' | 'subscriptions' | 'notifications' | 'cart' | 'my-sales' | 'my-orders' | 'admin-orders' | 'product-moderation' | 'product-reports' | 'data-confirmation-requests' | 'installment-payments' | 'installment-sales' | 'installment-moderation' | 'installment-disputes'} HomeMainView */

/**
 * @param {import('react-router-dom').Location} location
 * @param {import('react-router-dom').NavigateFunction} navigate
 */
export const useHomeMainView = (location, navigate) => {
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

  return {
    mainView,
    goToMainView,
    activeProfileTab,
    raffleRouteId,
    isRaffleRoute,
    isProfileMyProductsTab,
    isHomeCatalogMainView,
    isCatalogBrowserMainViewActive,
    isCatalogShellView,
    setMyProfileTab,
  };
};
