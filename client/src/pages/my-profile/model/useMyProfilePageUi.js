import { useCallback, useEffect, useMemo, useState } from "react";

import { getUserProfileRows } from "../../../entities/user/lib/getUserProfileRows.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "../../../entities/user/lib/profileImageFocus.js";
import { resolveUserProfileBackgroundFromUser } from "../../../entities/user/lib/userBackgroundValue.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import {
  isFullWidthCatalogProfileTab,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_OVERVIEW,
} from "../../../widgets/app-shell/lib/profileTabs.js";

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
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);

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

  useScrollLock(isMobileNavOpen);

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

  useEffect(() => {
    if (activeTab !== PROFILE_TAB_OVERVIEW) {
      setIsLogoutConfirmOpen(false);
    }
  }, [activeTab]);

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
    isLogoutConfirmOpen,
    setIsLogoutConfirmOpen,
    isMobileNavOpen,
    closeMobileNav,
    openMobileNav,
    avatarLoadFailed,
    backgroundLoadFailed,
    setAvatarLoadFailed,
    setBackgroundLoadFailed,
  };
}
