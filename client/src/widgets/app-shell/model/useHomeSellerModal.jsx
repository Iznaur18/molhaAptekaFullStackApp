import { useCallback, useEffect } from "react";

import { OPEN_USER_PROFILE_EVENT } from "../../../shared/lib/openUserProfileEvent.js";
import { buildUserProfilePath } from "../../../shared/lib/userProfilePaths.js";
import { buildSellerProductsPath } from "../../../shared/lib/sellerPaths.js";

/**
 * Открытие чужого профиля — navigate на `/user/:id` (не модалка).
 *
 * @param {{
 *   currentUserId: string | null;
 *   navigate: import('react-router-dom').NavigateFunction;
 *   goToMainView: (view: import('../../../shared/lib/homeMainViewPaths.js').HomeMainView) => void;
 * }} params
 */
export const useHomeSellerModal = ({
  currentUserId,
  navigate,
  goToMainView,
}) => {
  /** @param {string} userId */
  const goToSellerProducts = useCallback(
    (userId) => {
      if (currentUserId != null && String(userId) === String(currentUserId)) {
        goToMainView("my-products");
        return;
      }
      navigate(buildSellerProductsPath(userId));
    },
    [currentUserId, goToMainView, navigate],
  );

  /** @param {string} userId */
  const handleSellerNameClick = useCallback(
    (userId) => {
      if (currentUserId != null && String(userId) === String(currentUserId)) {
        goToMainView("my-products");
        return;
      }

      const path = buildUserProfilePath(userId);
      if (!path) {
        return;
      }
      navigate(path);
    },
    [currentUserId, goToMainView, navigate],
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

  return {
    goToSellerProducts,
    handleSellerNameClick,
  };
};
