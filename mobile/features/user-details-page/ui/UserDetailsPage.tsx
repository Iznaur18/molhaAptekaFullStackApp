import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { getUserProfileRows } from "@/entities/user/lib/getUserProfileRows";
import { mapSellerCatalogItemsToProducts } from "@/entities/user/lib/mapSellerCatalogItemsToProducts";
import { userProfileQueryKeys } from "@/entities/user/model/userProfileQueryKeys";
import { useUserProfileProductsQuery } from "@/entities/user/model/useUserProfileProductsQuery";
import { useUserProfileQuery } from "@/entities/user/model/useUserProfileQuery";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { UserFollowButton } from "@/features/user-follow/ui/UserFollowButton";
import { UserVoteRatingForm } from "@/features/user-vote-rating/ui/UserVoteRatingForm";
import {
  USER_DETAILS_PAGE_UI,
  USER_PROFILE_PRODUCTS_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const UserDetailsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string }>();
  const userId = String(params.id ?? "").trim();

  const sessionQuery = useAuthSessionQuery();
  const currentUser = sessionQuery.data?.user;
  const currentUserId = currentUser?._id != null ? String(currentUser._id) : null;
  const isAuthorized = Boolean(currentUser);

  const profileQuery = useUserProfileQuery({ userId, enabled: userId.length > 0 });
  const [profileSnapshot, setProfileSnapshot] = useState<Record<string, unknown> | null>(null);

  const user = profileSnapshot ?? (profileQuery.data as Record<string, unknown> | undefined) ?? null;
  const isSelf = currentUserId != null && userId === currentUserId;

  const productsQuery = useUserProfileProductsQuery({
    userId,
    enabled: userId.length > 0 && !isSelf,
  });

  const previewProducts = useMemo(() => {
    const items = productsQuery.data?.items ?? [];
    return mapSellerCatalogItemsToProducts(items);
  }, [productsQuery.data?.items]);

  const profileRows = useMemo(
    () => (user ? getUserProfileRows(user, { hideMediaUrls: true }) : []),
    [user],
  );

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

  const handleRated = useCallback(
    (snapshot: Record<string, unknown>) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(userId), snapshot);
      setProfileSnapshot(snapshot);
    },
    [queryClient, userId],
  );

  if (!userId) {
    return (
      <ScreenErrorState
        message={USER_DETAILS_PAGE_UI.FETCH_FALLBACK}
        onRetry={() => router.back()}
      />
    );
  }

  if (profileQuery.isPending) {
    return <ScreenLoadingState message={USER_DETAILS_PAGE_UI.LOADING} />;
  }

  if (profileQuery.isError || !user) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(profileQuery.error, USER_DETAILS_PAGE_UI.FETCH_FALLBACK)}
        onRetry={() => profileQuery.refetch()}
      />
    );
  }

  const displayName = String(user.userName ?? "").trim() || USER_DETAILS_PAGE_UI.TITLE;
  const isFollowing = user.isFollowing === true;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={profileQuery.isRefetching} onRefresh={profileQuery.refetch} />
      }
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{displayName}</Text>

      <ProfileOverviewBanner user={user} />

      <UserFollowButton
        targetUserId={userId}
        isFollowing={isFollowing}
        isAuthorized={isAuthorized}
        isSelf={isSelf}
        onFollowChange={handleFollowChange}
      />

      <UserProfileInfoPanel rows={profileRows} />

      {!isSelf ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {USER_PROFILE_PRODUCTS_UI.HEADING}
          </Text>
          {productsQuery.isPending ? (
            <ActivityIndicator style={styles.loader} />
          ) : null}
          {previewProducts.length === 0 && !productsQuery.isPending ? (
            <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
              {USER_PROFILE_PRODUCTS_UI.EMPTY}
            </Text>
          ) : null}
          <View style={styles.productsGrid}>
            {previewProducts.map((product) => (
              <View key={String(product._id)} style={styles.productCell}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
          <Pressable
            style={[styles.viewAllButton, { borderColor: theme.colors.nearBlack }]}
            onPress={() => router.push({ pathname: "/seller/[userId]", params: { userId } })}
          >
            <Text style={[styles.viewAllText, { color: theme.colors.nearBlack }]}>
              {USER_PROFILE_PRODUCTS_UI.VIEW_ALL}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <UserVoteRatingForm
        targetUser={user as Record<string, unknown> & { _id: string }}
        currentUserId={currentUserId}
        isAuthorized={isAuthorized}
        onRated={handleRated}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  section: {
    marginTop: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    fontSize: 14,
  },
  loader: {
    marginVertical: 8,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  productCell: {
    width: "48%",
  },
  viewAllButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
