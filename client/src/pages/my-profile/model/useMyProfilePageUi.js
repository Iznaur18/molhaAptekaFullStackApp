import { useCallback, useEffect, useMemo, useState } from "react";

import { getUserProfileRows } from "../../../entities/user/lib/getUserProfileRows.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "../../../entities/user/lib/profileImageFocus.js";
import { resolveUserProfileBackgroundFromUser } from "../../../entities/user/lib/userBackgroundValue.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import { scheduleOpenAfterPaint } from "../../../shared/lib/scheduleOpenAfterPaint.js";
import { useMaxWidthMediaQuery } from "../../../shared/lib/useMaxWidthMediaQuery.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import {
  isFullWidthCatalogProfileTab,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_OVERVIEW,
} from "../../../widgets/app-shell/lib/profileTabs.js";
import {
  MY_PROFILE_DRAWER_LAYOUT_MAX_PX,
  MY_PROFILE_MOBILE_NAV_EXIT_MS,
} from "../lib/myProfileMobileNavConstants.js";

/**
 * @param {{
 *   user: import('../../../entities/user/model/types.js').UserPublicProfile | null;
 *   isProfileReady: boolean;
 *   activeTab: string;
 *   canUseEditProfile: boolean;
 *   isRegularUser: boolean;
 * }} params
 */
export function useMyProfilePageUi({
  user,
  isProfileReady,
  activeTab,
  canUseEditProfile,
  isRegularUser,
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileNavMounted, setIsMobileNavMounted] = useState(false);
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);

  const isDrawerLayout = useMaxWidthMediaQuery(MY_PROFILE_DRAWER_LAYOUT_MAX_PX);

  const photoUrl = user ? pickUserProfilePhotoUrl(user) : null;
  const avatarObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserAvatarFocus(user)),
    [user],
  );
  const backgroundObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserBackgroundFocus(user)),
    [user],
  );
  const profileBackground = user ? resolveUserProfileBackgroundFromUser(user) : null;
  const rows = useMemo(
    () =>
      user
        ? getUserProfileRows(user, { showAdminRole: false, hideMediaUrls: true })
        : [],
    [user],
  );

  const isMyProductsTab = activeTab === PROFILE_TAB_MY_PRODUCTS;
  const isFullWidthCatalogTab = isFullWidthCatalogProfileTab(activeTab);
  const canShowBackground =
    Boolean(profileBackground) &&
    (profileBackground.kind === "preset" ||
      (profileBackground.kind === "image" && !backgroundLoadFailed));
  const showProfileBanner =
    Boolean(user) && (canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed));
  const showEditOnBanner =
    isRegularUser &&
    canUseEditProfile &&
    activeTab === PROFILE_TAB_OVERVIEW &&
    showProfileBanner;

  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), []);

  // overflow-only: body position:fixed на iOS оставляет тёмные полосы в safe-area
  useScrollLock(isMobileNavMounted, { strategy: "overflow" });

  useEffect(() => {
    if (!isMobileNavMounted) {
      return undefined;
    }

    const root = document.documentElement;
    root.classList.add("my-profile-mobile-nav-open");

    const bg = getComputedStyle(root).getPropertyValue("--iz-color-bg").trim();
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const previousThemeColor = themeColorMeta?.getAttribute("content") ?? null;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }
    if (bg) {
      themeColorMeta.setAttribute("content", bg);
    }

    return () => {
      root.classList.remove("my-profile-mobile-nav-open");
      if (!themeColorMeta) {
        return;
      }
      if (previousThemeColor == null) {
        themeColorMeta.remove();
      } else {
        themeColorMeta.setAttribute("content", previousThemeColor);
      }
    };
  }, [isMobileNavMounted]);

  useEffect(() => {
    if (!isDrawerLayout) {
      setIsMobileNavOpen(false);
      setIsMobileNavMounted(false);
      setIsMobileNavVisible(false);
    }
  }, [isDrawerLayout]);

  // Mount closed → paint → --open (иначе на ПК enter схлопывается).
  // При закрытии держим DOM до конца exit.
  useEffect(() => {
    if (!isDrawerLayout) {
      return undefined;
    }

    if (isMobileNavOpen) {
      setIsMobileNavMounted(true);
      return undefined;
    }

    setIsMobileNavVisible(false);

    if (!isMobileNavMounted) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsMobileNavMounted(false);
    }, MY_PROFILE_MOBILE_NAV_EXIT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isDrawerLayout, isMobileNavOpen, isMobileNavMounted]);

  useEffect(() => {
    if (!isDrawerLayout || !isMobileNavOpen || !isMobileNavMounted) {
      return undefined;
    }
    return scheduleOpenAfterPaint(setIsMobileNavVisible);
  }, [isDrawerLayout, isMobileNavOpen, isMobileNavMounted]);

  useEffect(() => {
    closeMobileNav();
  }, [activeTab, closeMobileNav]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMobileNav, isMobileNavOpen]);

  useEffect(() => {
    setAvatarLoadFailed(false);
    setBackgroundLoadFailed(false);
  }, [user?._id]);

  return {
    rows,
    photoUrl,
    avatarObjectPosition,
    backgroundObjectPosition,
    profileBackground,
    canShowBackground,
    showProfileBanner,
    showEditOnBanner,
    isMyProductsTab,
    isFullWidthCatalogTab,
    isDrawerLayout,
    isMobileNavOpen,
    isMobileNavMounted,
    isMobileNavVisible,
    closeMobileNav,
    openMobileNav,
    avatarLoadFailed,
    backgroundLoadFailed,
    setAvatarLoadFailed,
    setBackgroundLoadFailed,
  };
}
