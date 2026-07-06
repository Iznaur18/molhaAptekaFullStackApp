import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { userProfileQueryKeys } from "@/entities/user/model/userProfileQueryKeys";
import { useSellerProductsInfiniteQuery } from "@/entities/user/model/useSellerProductsInfiniteQuery";
import { useUserProfileQuery } from "@/entities/user/model/useUserProfileQuery";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { UserFollowButton } from "@/features/user-follow/ui/UserFollowButton";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import { CatalogAnimatedFlatList } from "@/features/catalog-grid/ui/CatalogAnimatedFlatList";
import { CatalogScrollAnimationProvider } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";
import { SELLER_PRODUCTS_PAGE_UI, USER_LIST_ROW_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useSellerProductsPageStyles } from "@/shared/theme/sellerFlowStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const SellerProductsPage = () => {
  const router = useRouter();
  const styles = useSellerProductsPageStyles();
  const productGrid = useProductGridLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
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

  const catalogGridRows = useMemo(
    () =>
      buildCatalogGridRows(catalogQuery.products, productGrid.columns, {
        showFullWidthTier3Banners: true,
      }),
    [catalogQuery.products, productGrid.columns],
  );

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
      <View style={styles.centered}>
        <Text style={styles.hint}>{SELLER_PRODUCTS_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
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
    <CatalogScrollAnimationProvider>
      <View style={[styles.container, centeredContentStyle]}>
        <CatalogAnimatedFlatList
        key={productGrid.listKey}
        style={styles.listFlex}
        data={catalogGridRows}
        keyExtractor={(item) => item.key}
        numColumns={1}
        contentContainerStyle={[
          styles.list,
          resolveCatalogGridListContentStyle(productGrid.gap),
          { paddingBottom: contentPaddingBottom },
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <ThemedRefreshControl
            refreshing={catalogQuery.isRefetching || profileQuery.isRefetching}
            onRefresh={() => {
              void profileQuery.refetch();
              void catalogQuery.refetch();
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{pageTitle}</Text>
            {seller ? <ProfileOverviewBanner user={seller} /> : null}
            {seller ? (
              <View style={styles.sellerMetaZone}>
                <View style={styles.sellerMetaName}>
                  <UserPremiumDisplayName
                    name={String(seller.userName ?? "").trim() || USER_LIST_ROW_UI.MISSING_NAME}
                    isPremium={seller.isPremiumUser === true}
                    isUserDataConfirmed={seller.isUserDataConfirmed === true}
                    textStyle={styles.sellerName}
                  />
                </View>
                <UserFollowButton
                  targetUserId={sellerId}
                  isFollowing={isFollowing}
                  isAuthorized={isAuthorized}
                  isSelf={isSelf}
                  layout="inline"
                  onFollowChange={handleFollowChange}
                />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={<Text style={styles.hint}>{SELLER_PRODUCTS_PAGE_UI.EMPTY}</Text>}
        ListFooterComponent={
          catalogQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
        renderItem={({ item, index }) => (
          <CatalogGridRowItem
            row={item}
            columns={productGrid.columns}
            gap={productGrid.gap}
            tileWidth={productGrid.tileWidth}
            rowIndex={index}
          />
        )}
        />
      </View>
    </CatalogScrollAnimationProvider>
  );
};
