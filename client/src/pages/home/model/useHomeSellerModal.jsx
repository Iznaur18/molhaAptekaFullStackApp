import { useCallback, useRef, useState } from "react";

import { fetchUserProfileById } from "../../../entities/user/api/fetchUserProfileById.js";
import { UserFollowButton } from "../../../entities/user-follow/ui/UserFollowButton.jsx";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { EMPTY_PROFILE_MODAL } from "../lib/homePageConstants.js";

/**
 * @param {{
 *   currentUserId: string | null;
 *   isAuthorized: boolean;
 *   setIsLoginModalOpen: (open: boolean) => void;
 *   setIsAdminEditUserOpen: (open: boolean) => void;
 *   setIsAdminDeleteUserOpen: (open: boolean) => void;
 * }} params
 */
export const useHomeSellerModal = ({
  currentUserId,
  isAuthorized,
  setIsLoginModalOpen,
  setIsAdminEditUserOpen,
  setIsAdminDeleteUserOpen,
}) => {
  const sellerFetchSeq = useRef(0);
  const [sellerModal, setSellerModal] = useState(EMPTY_PROFILE_MODAL);

  const closeSellerModal = useCallback(() => {
    sellerFetchSeq.current += 1;
    setSellerModal(EMPTY_PROFILE_MODAL);
    setIsAdminEditUserOpen(false);
    setIsAdminDeleteUserOpen(false);
  }, [setIsAdminDeleteUserOpen, setIsAdminEditUserOpen]);

  /** @param {string} userId */
  const handleSellerNameClick = useCallback((userId) => {
    const seq = ++sellerFetchSeq.current;
    setSellerModal({ open: true, phase: "loading", user: null, error: "" });

    void (async () => {
      try {
        const user = await fetchUserProfileById(userId);
        if (seq !== sellerFetchSeq.current) {
          return;
        }
        setSellerModal({ open: true, phase: "success", user, error: "" });
      } catch (e) {
        if (seq !== sellerFetchSeq.current) {
          return;
        }
        const error =
          e instanceof Error ? e.message : HOME_PAGE_UI.FETCH_PROFILE_FALLBACK;
        setSellerModal({ open: true, phase: "error", user: null, error });
      }
    })();
  }, []);

  /**
   * @param {{
   *   isFollowing: boolean;
   *   followersCount?: number;
   *   followingCount?: number;
   * }} patch
   */
  const handleSellerFollowChange = useCallback((patch) => {
    setSellerModal((prev) => {
      if (prev.phase !== "success" || !prev.user) {
        return prev;
      }
      return {
        ...prev,
        user: {
          ...prev.user,
          isFollowing: patch.isFollowing,
          ...(patch.followersCount != null
            ? { followersCount: patch.followersCount }
            : {}),
          ...(patch.followingCount != null
            ? { followingCount: patch.followingCount }
            : {}),
        },
      };
    });
  }, []);

  const renderSellerFollowAccessory = useCallback(() => {
    if (sellerModal.phase !== "success" || !sellerModal.user) {
      return null;
    }
    if (
      !currentUserId ||
      String(sellerModal.user._id) === String(currentUserId)
    ) {
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
    handleSellerNameClick,
    renderSellerFollowAccessory,
  };
};
