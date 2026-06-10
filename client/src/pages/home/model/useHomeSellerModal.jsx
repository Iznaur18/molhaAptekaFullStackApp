import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { UserFollowButton } from "../../../entities/user-follow/ui/UserFollowButton.jsx";
import { useUserProfileQuery } from "../../../entities/user/model/useUserProfileQuery.js";
import { userProfileQueryKeys } from "../../../entities/user/model/userProfileQueryKeys.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { OPEN_USER_PROFILE_EVENT } from "../../../shared/lib/openUserProfileEvent.js";
import { buildSellerProductsPath } from "../../../shared/lib/sellerPaths.js";
import { EMPTY_PROFILE_MODAL } from "../lib/catalogShellConstants.js";

/**
 * @param {{
 *   currentUserId: string | null;
 *   isAuthorized: boolean;
 *   navigate: import('react-router-dom').NavigateFunction;
 *   goToMainView: (view: import('../../../shared/lib/homeMainViewPaths.js').HomeMainView) => void;
 *   setIsLoginModalOpen: (open: boolean) => void;
 *   setIsAdminEditUserOpen: (open: boolean) => void;
 *   setIsAdminDeleteUserOpen: (open: boolean) => void;
 * }} params
 */
export const useHomeSellerModal = ({
  currentUserId,
  isAuthorized,
  navigate,
  goToMainView,
  setIsLoginModalOpen,
  setIsAdminEditUserOpen,
  setIsAdminDeleteUserOpen,
}) => {
  const queryClient = useQueryClient();
  const [sellerUserId, setSellerUserId] = useState(/** @type {string | null} */ (null));

  const profileQuery = useUserProfileQuery({
    userId: sellerUserId ?? "",
    enabled: Boolean(sellerUserId),
  });

  const sellerModal = useMemo(() => {
    if (!sellerUserId) {
      return EMPTY_PROFILE_MODAL;
    }

    if (profileQuery.isLoading) {
      return { open: true, phase: "loading", user: null, error: "" };
    }

    if (profileQuery.isError) {
      const error =
        profileQuery.error instanceof Error
          ? profileQuery.error.message
          : HOME_PAGE_UI.FETCH_PROFILE_FALLBACK;
      return { open: true, phase: "error", user: null, error };
    }

    if (profileQuery.data) {
      return { open: true, phase: "success", user: profileQuery.data, error: "" };
    }

    return { open: true, phase: "error", user: null, error: HOME_PAGE_UI.FETCH_PROFILE_FALLBACK };
  }, [profileQuery.data, profileQuery.error, profileQuery.isError, profileQuery.isLoading, sellerUserId]);

  const closeSellerModal = useCallback(() => {
    setSellerUserId(null);
    setIsAdminEditUserOpen(false);
    setIsAdminDeleteUserOpen(false);
  }, [setIsAdminDeleteUserOpen, setIsAdminEditUserOpen]);

  /** @param {string} userId */
  const goToSellerProducts = useCallback(
    (userId) => {
      setSellerUserId(null);
      setIsAdminEditUserOpen(false);
      setIsAdminDeleteUserOpen(false);

      if (currentUserId != null && String(userId) === String(currentUserId)) {
        goToMainView("my-products");
        return;
      }
      navigate(buildSellerProductsPath(userId));
    },
    [
      currentUserId,
      goToMainView,
      navigate,
      setIsAdminDeleteUserOpen,
      setIsAdminEditUserOpen,
    ],
  );

  /** @param {string} userId */
  const handleSellerNameClick = useCallback(
    (userId) => {
      if (currentUserId != null && String(userId) === String(currentUserId)) {
        goToMainView("my-products");
        return;
      }

      setSellerUserId(String(userId));
    },
    [currentUserId, goToMainView],
  );

  useEffect(() => {
    const handleOpenUserProfile = (event) => {
      const userId = event.detail?.userId;
      if (!userId) {
        return;
      }
      handleSellerNameClick(String(userId));
    };

    window.addEventListener(OPEN_USER_PROFILE_EVENT, handleOpenUserProfile);
    return () => {
      window.removeEventListener(OPEN_USER_PROFILE_EVENT, handleOpenUserProfile);
    };
  }, [handleSellerNameClick]);

  /**
   * @param {{
   *   isFollowing: boolean;
   *   followersCount?: number;
   *   followingCount?: number;
   * }} patch
   */
  const handleSellerFollowChange = useCallback(
    (patch) => {
      if (!sellerUserId || !profileQuery.data) {
        return;
      }

      queryClient.setQueryData(userProfileQueryKeys.byId(sellerUserId), {
        ...profileQuery.data,
        isFollowing: patch.isFollowing,
        ...(patch.followersCount != null
          ? { followersCount: patch.followersCount }
          : {}),
        ...(patch.followingCount != null
          ? { followingCount: patch.followingCount }
          : {}),
      });
    },
    [profileQuery.data, queryClient, sellerUserId],
  );

  const setSellerModal = useCallback(
    (next) => {
      if (!next.open) {
        setSellerUserId(null);
        return;
      }
      if (next.user?._id) {
        setSellerUserId(String(next.user._id));
        queryClient.setQueryData(userProfileQueryKeys.byId(String(next.user._id)), next.user);
      }
    },
    [queryClient],
  );

  const renderSellerFollowAccessory = useCallback(() => {
    if (sellerModal.phase !== "success" || !sellerModal.user) {
      return null;
    }
    if (!currentUserId || String(sellerModal.user._id) === String(currentUserId)) {
      return null;
    }
    return (
      <UserFollowButton
        targetUserId={String(sellerModal.user._id)}
        isFollowing={sellerModal.user.isFollowing === true}
        isAuthorized={isAuthorized}
        isSelf={false}
        onRequestLogin={() => setIsLoginModalOpen(true)}
        onFollowChange={handleSellerFollowChange}
      />
    );
  }, [
    currentUserId,
    handleSellerFollowChange,
    isAuthorized,
    sellerModal,
    setIsLoginModalOpen,
  ]);

  return {
    sellerModal,
    setSellerModal,
    closeSellerModal,
    goToSellerProducts,
    handleSellerNameClick,
    renderSellerFollowAccessory,
  };
};
