import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { userProfileQueryKeys } from "@/entities/user/model/userProfileQueryKeys";
import { useSellerProductsInfiniteQuery } from "@/entities/user/model/useSellerProductsInfiniteQuery";
import { useUserProfileQuery } from "@/entities/user/model/useUserProfileQuery";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserFollowButton } from "@/features/user-follow/ui/UserFollowButton";
import { SELLER_PRODUCTS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const NUM_COLUMNS = 2;

export const SellerProductsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ userId?: string }>();
  const sellerId = String(params.userId ?? "").trim();

  const sessionQuery = useAuthSessionQuery();
  const isAuthorized = useIsAuthorized();
  const currentUserId =
    sessionQuery.data?.user?._id != null ? String(sessionQuery.data.user._id) : null;
  const isSessionReady = !sessionQuery.isPending;

  const profileQuery = useUserProfileQuery({
    userId: sellerId,
    enabled: isSessionReady && sellerId.length > 0,
  });
  const catalogQuery = useSellerProductsInfiniteQuery({
    sellerId,
    enabled: isSessionReady && sellerId.length > 0,
  });

  const seller = profileQuery.data as Record<string, unknown> | undefined;
  const isSelf = currentUserId != null && sellerId === currentUserId;

  useEffect(() => {
    if (isSelf && sellerId.length > 0) {
      router.replace("/hub/my-products");
    }
  }, [isSelf, router, sellerId]);

  const handleFollowChange = useCallback(
    (patch: { isFollowing: boolean }) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(sellerId), (old) => {
        if (!old || typeof old !== "object") {
          return old;
        }
        return { ...old, isFollowing: patch.isFollowing };
      });
    },
    [queryClient, sellerId],
  );

  const handleLoadMore = useCallback(() => {
    if (catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage) {
      void catalogQuery.fetchNextPage();
    }
  }, [catalogQuery]);

  if (!sellerId) {
    return (
      <ScreenErrorState
        message={SELLER_PRODUCTS_PAGE_UI.FETCH_PROFILE_FALLBACK}
        onRetry={() => router.back()}
      />
    );
  }

  if (!isSessionReady) {
    return <ScreenLoadingState message={SELLER_PRODUCTS_PAGE_UI.LOADING} />;
  }

  if (!isAuthorized) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.bg }]}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {SELLER_PRODUCTS_PAGE_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>{SELLER_PRODUCTS_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  const isPageLoading =
    profileQuery.isPending || (catalogQuery.phase === "loading" && catalogQuery.products.length === 0);

  if (isPageLoading) {
    return <ScreenLoadingState message={SELLER_PRODUCTS_PAGE_UI.LOADING} />;
  }

  const pageError =
    profileQuery.isError
      ? formatApiErrorMessage(profileQuery.error, SELLER_PRODUCTS_PAGE_UI.FETCH_PROFILE_FALLBACK)
      : catalogQuery.phase === "error"
        ? catalogQuery.error
        : "";

  if (pageError) {
    return (
      <ScreenErrorState
        message={pageError}
        onRetry={() => {
          void profileQuery.refetch();
          void catalogQuery.refetch();
        }}
      />
    );
  }

  const sellerName = String(seller?.userName ?? "").trim() || "продавца";
  const pageTitle = SELLER_PRODUCTS_PAGE_UI.TITLE_FOR(sellerName);
  const isFollowing = seller?.isFollowing === true;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <FlatList
        data={catalogQuery.products}
        keyExtractor={(item) => String(item._id)}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={catalogQuery.isRefetching || profileQuery.isRefetching}
            onRefresh={() => {
              void profileQuery.refetch();
              void catalogQuery.refetch();
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{pageTitle}</Text>
            {seller ? <ProfileOverviewBanner user={seller} /> : null}
            <UserFollowButton
              targetUserId={sellerId}
              isFollowing={isFollowing}
              isAuthorized={isAuthorized}
              isSelf={isSelf}
              onFollowChange={handleFollowChange}
            />
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            {SELLER_PRODUCTS_PAGE_UI.EMPTY}
          </Text>
        }
        ListFooterComponent={
          catalogQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 12,
    paddingBottom: 32,
    gap: 8,
  },
  header: {
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  cell: {
    flex: 1,
    maxWidth: "50%",
    padding: 4,
  },
  hint: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
  },
  footerLoader: {
    marginVertical: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
