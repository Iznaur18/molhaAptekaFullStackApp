import { useCallback, useEffect, useMemo } from "react";

import {
  PROFILE_TAB_OVERVIEW,
  normalizeProfileTab,
} from "../../my-profile/lib/profileTabs.js";

import {
  mainViewToProfileTab,
  profileTabToMainView,
} from "../../my-profile/lib/profileTabToMainView.js";

import {
  mainViewToPathname,
  pathnameToMainView,
} from "../../../shared/lib/homeMainViewPaths.js";

import { parseRaffleIdFromPathname } from "../../../shared/lib/rafflePaths.js";

import { parseSellerIdFromPathname } from "../../../shared/lib/sellerPaths.js";

/** @typedef {import('../../../shared/lib/homeMainViewPaths.js').HomeMainView} HomeMainView */

/**

 * @param {import('react-router-dom').Location} location

 * @param {import('react-router-dom').NavigateFunction} navigate

 */

export function useAppShellNavigation(location, navigate) {
  const mainView = useMemo(() => {
    return pathnameToMainView(location.pathname) ?? "catalog";
  }, [location.pathname]);

  const goToMainView = useCallback(
    (/** @type {HomeMainView} */ view) => {
      navigate(mainViewToPathname(view));
    },

    [navigate],
  );

  const activeProfileTab = useMemo(() => {
    return mainViewToProfileTab(mainView) ?? PROFILE_TAB_OVERVIEW;
  }, [mainView]);

  useEffect(() => {
    if (mainView !== "my-profile") {
      return;
    }

    const legacyTab = new URLSearchParams(location.search).get("tab");

    if (!legacyTab) {
      return;
    }

    const targetView = profileTabToMainView(normalizeProfileTab(legacyTab));

    navigate(mainViewToPathname(targetView), { replace: true });
  }, [location.search, mainView, navigate]);

  const raffleRouteId = useMemo(
    () => parseRaffleIdFromPathname(location.pathname),

    [location.pathname],
  );

  const sellerRouteId = useMemo(
    () => parseSellerIdFromPathname(location.pathname),

    [location.pathname],
  );

  const isRaffleRoute = raffleRouteId != null;

  const isSellerRoute = sellerRouteId != null;

  const isMyProductsRoute = mainView === "my-products";

  const setMyProfileTab = useCallback(
    (tab) => {
      const view = profileTabToMainView(tab);

      navigate(mainViewToPathname(view));
    },

    [navigate],
  );

  return {
    mainView,

    goToMainView,

    activeProfileTab,

    raffleRouteId,

    isRaffleRoute,

    sellerRouteId,

    isSellerRoute,

    isMyProductsRoute,

    setMyProfileTab,
  };
}
