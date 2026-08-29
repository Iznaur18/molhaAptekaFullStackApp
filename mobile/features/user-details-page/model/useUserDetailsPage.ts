import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { canViewOtherUserPurchases } from "@/entities/user/lib/canViewOtherUserPurchases";
import { getUserProfileRows } from "@/entities/user/lib/getUserProfileRows";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { userProfileQueryKeys } from "@/entities/user/model/userProfileQueryKeys";
import { useUserProfileQuery } from "@/entities/user/model/useUserProfileQuery";

export const useUserDetailsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string }>();
  const userId = String(params.id ?? "").trim();

  const sessionQuery = useAuthSessionQuery();
  const { canModerate, canModerateProducts, isPremiumUser } = useUserAccess();
  const currentUser = sessionQuery.data?.user;
  const currentUserId = currentUser?._id != null ? String(currentUser._id) : null;
  const isAuthorized = Boolean(currentUser);

  const profileQuery = useUserProfileQuery({ userId, enabled: userId.length > 0 });
  const [profileSnapshot, setProfileSnapshot] = useState<Record<string, unknown> | null>(null);

  const user = profileSnapshot ?? (profileQuery.data as Record<string, unknown> | undefined) ?? null;
  const isSelf = currentUserId != null && userId === currentUserId;
  const isOtherUser = !isSelf && userId.length > 0;

  const profileRows = useMemo(
    () => (user ? getUserProfileRows(user, { hideMediaUrls: true }) : []),
    [user],
  );

  const showOtherUserProducts = isOtherUser;
  const showOtherUserPurchases = canViewOtherUserPurchases({
    isAuthorized,
    isPremiumUser,
    canModerateProducts,
    isOtherUser,
  });

  useEffect(() => {
    setProfileSnapshot(null);
  }, [userId]);

  useEffect(() => {
    if (isSelf && userId.length > 0) {
      router.replace("/hub/overview");
    }
  }, [isSelf, router, userId]);

  const handleFollowChange = useCallback(
    (patch: { isFollowing: boolean }) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(userId), (old) => {
        if (!old || typeof old !== "object") {
          return old;
        }
        return { ...old, isFollowing: patch.isFollowing };
      });
      setProfileSnapshot((prev) =>
        prev ? { ...prev, isFollowing: patch.isFollowing } : prev,
      );
    },
    [queryClient, userId],
  );

  const handleBlockChange = useCallback(
    (patch: { isBlockedByMe: boolean }) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(userId), (old) => {
        if (!old || typeof old !== "object") {
          return old;
        }
        return {
          ...old,
          isBlockedByMe: patch.isBlockedByMe,
          ...(patch.isBlockedByMe ? { isFollowing: false } : {}),
        };
      });
      setProfileSnapshot((prev) =>
        prev
          ? {
              ...prev,
              isBlockedByMe: patch.isBlockedByMe,
              ...(patch.isBlockedByMe ? { isFollowing: false } : {}),
            }
          : prev,
      );
    },
    [queryClient, userId],
  );

  const handleRated = useCallback(
    (snapshot: Record<string, unknown>) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(userId), snapshot);
      setProfileSnapshot(snapshot);
    },
    [queryClient, userId],
  );

  const handleViewAllSellerProducts = useCallback(() => {
    router.push({ pathname: "/seller/[userId]", params: { userId } });
  }, [router, userId]);

  const handleEditUser = useCallback(() => {
    router.push({ pathname: "/user/[id]/edit", params: { id: userId } });
  }, [router, userId]);

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
    canModerate,
    handleFollowChange,
    handleBlockChange,
    handleRated,
    handleViewAllSellerProducts,
    handleEditUser,
  };
};
