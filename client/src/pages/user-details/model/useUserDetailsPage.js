import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getUserProfileRows } from "../../../entities/user/lib/getUserProfileRows.js";
import { userProfileQueryKeys } from "../../../entities/user/model/userProfileQueryKeys.js";
import { useUserProfileQuery } from "../../../entities/user/model/useUserProfileQuery.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { HOME_MAIN_VIEW_PATH } from "../../../shared/lib/homeMainViewPaths.js";
import { buildSellerProductsPath } from "../../../shared/lib/sellerPaths.js";
import { useAppShellStateContext } from "../../../widgets/app-shell/model/AppShellStateContext.jsx";

/**
 * Паритет с mobile `useUserDetailsPage`.
 */
export function useUserDetailsPage() {
  const { userId: userIdParam } = useParams();
  const userId = userIdParam != null ? String(userIdParam).trim() : "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const shell = useAppShellStateContext();

  const currentUserId = shell.currentUserId ?? null;
  const isAuthorized = Boolean(shell.isAuthorized);
  const isPremiumUser = Boolean(shell.isPremiumUser);
  const canModerateProducts = Boolean(shell.canModerateProducts);
  const isAdmin = Boolean(shell.isAdmin);

  const profileQuery = useUserProfileQuery({
    userId,
    enabled: userId.length > 0,
  });

  const [profileSnapshot, setProfileSnapshot] = useState(
    /** @type {import('../../../entities/user/model/types.js').UserPublicProfile | null} */ (
      null
    ),
  );

  const user = profileSnapshot ?? profileQuery.data ?? null;
  const isSelf = currentUserId != null && userId === String(currentUserId);
  const isOtherUser = !isSelf && userId.length > 0;

  const profileRows = useMemo(
    () =>
      user
        ? getUserProfileRows(user, {
            showAdminRole: canModerateProducts,
            hideMediaUrls: true,
          })
        : [],
    [canModerateProducts, user],
  );

  const showOtherUserProducts = isOtherUser;
  const showOtherUserPurchases =
    isOtherUser && isAuthorized && (isPremiumUser || canModerateProducts);

  useEffect(() => {
    setProfileSnapshot(null);
  }, [userId]);

  useEffect(() => {
    if (isSelf && userId.length > 0) {
      navigate(HOME_MAIN_VIEW_PATH["my-profile"], { replace: true });
    }
  }, [isSelf, navigate, userId]);

  const handleFollowChange = useCallback(
    (patch) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(userId), (old) => {
        if (!old || typeof old !== "object") {
          return old;
        }
        return {
          ...old,
          isFollowing: patch.isFollowing,
          ...(patch.followersCount != null
            ? { followersCount: patch.followersCount }
            : {}),
          ...(patch.followingCount != null
            ? { followingCount: patch.followingCount }
            : {}),
        };
      });
      setProfileSnapshot((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: patch.isFollowing,
              ...(patch.followersCount != null
                ? { followersCount: patch.followersCount }
                : {}),
              ...(patch.followingCount != null
                ? { followingCount: patch.followingCount }
                : {}),
            }
          : prev,
      );
    },
    [queryClient, userId],
  );

  const handleRated = useCallback(
    (snapshot) => {
      if (!snapshot || typeof snapshot !== "object") {
        return;
      }
      // Сервер отвечает на оценку урезанным пользователем (только рейтинг + идентификация),
      // поэтому сливаем в существующий профиль, а не затираем его целиком.
      queryClient.setQueryData(userProfileQueryKeys.byId(userId), (old) =>
        old && typeof old === "object" ? { ...old, ...snapshot } : snapshot,
      );
      setProfileSnapshot((prev) => {
        const base = prev ?? profileQuery.data ?? null;
        return base ? { ...base, ...snapshot } : snapshot;
      });
    },
    [profileQuery.data, queryClient, userId],
  );

  const handleViewAllSellerProducts = useCallback(() => {
    navigate(buildSellerProductsPath(userId));
  }, [navigate, userId]);

  const handleProductClick = useCallback(
    (product) => {
      navigateToProductDetails(navigate, product);
    },
    [navigate],
  );

  const handleRequestLogin = useCallback(() => {
    shell.setIsLoginModalOpen?.(true);
  }, [shell]);

  return {
    userId,
    user,
    profileQuery,
    profileRows,
    currentUserId,
    isAuthorized,
    isSelf,
    isOtherUser,
    showOtherUserProducts,
    showOtherUserPurchases,
    canModerateProducts,
    isAdmin,
    handleFollowChange,
    handleRated,
    handleViewAllSellerProducts,
    handleProductClick,
    handleRequestLogin,
    refreshUsersList: shell.refreshUsersList,
    refreshCatalogFeed: shell.refreshCatalogFeed,
    setStaffActionNotice: shell.setStaffActionNotice,
  };
}
