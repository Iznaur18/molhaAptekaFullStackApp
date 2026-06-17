import { useCallback, useEffect, useMemo } from "react";

import {
  PROFILE_TAB_OVERVIEW,
  normalizeProfileTab,
} from "../lib/profileTabs.js";

import {
  mainViewToProfileTab,
  profileTabToMainView,
} from "../lib/profileTabToMainView.js";

import {
  mainViewToPathname,
  pathnameToMainView,
} from "../../../shared/lib/homeMainViewPaths.js";

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
    isMyProductsRoute,
    setMyProfileTab,
  };
}
