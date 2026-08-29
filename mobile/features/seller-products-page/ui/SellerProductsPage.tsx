import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { fetchPublicSellerShelves } from "@/entities/seller-shelf/api/sellerShelfApi";
import { sellerShelfQueryKeys } from "@/entities/seller-shelf/model/sellerShelfQueryKeys";
import { userProfileQueryKeys } from "@/entities/user/model/userProfileQueryKeys";
import { useSellerProductsInfiniteQuery } from "@/entities/user/model/useSellerProductsInfiniteQuery";
import { useUserProfileQuery } from "@/entities/user/model/useUserProfileQuery";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { SellerProfileQuickStats } from "@/entities/user/ui/SellerProfileQuickStats";
import { SellerShareLinkButton } from "@/entities/user/ui/SellerShareLinkButton";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { UserFollowButton } from "@/features/user-follow/ui/UserFollowButton";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import { CatalogAnimatedFlatList } from "@/features/catalog-grid/ui/CatalogAnimatedFlatList";
import { CatalogScrollAnimationProvider } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";
import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { SELLER_PRODUCTS_PAGE_UI, USER_LIST_ROW_UI, PRODUCT_CARD_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { navigateBackOrHome } from "@/shared/lib/navigateBackOrHome";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useSellerProductsPageStyles } from "@/shared/theme/sellerFlowStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const SellerProductsPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useSellerProductsPageStyles();
  const theme = useAppTheme();
  const productGrid = useProductGridLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ userId?: string }>();
  const sellerId = String(params.userId ?? "").trim();

  const sessionQuery = useAuthSessionQuery();
  const isAuthorized = useIsAuthorized();
  const { viewerRegionCode } = useViewerRegion();
  const currentUserId =
    sessionQuery.data?.user?._id != null ? String(sessionQuery.data.user._id) : null;
  const isSessionReady = !sessionQuery.isPending;

  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);

  const profileQuery = useUserProfileQuery({
    userId: sellerId,
    enabled: isSessionReady && sellerId.length > 0,
  });
  const shelvesQuery = useQuery({
    queryKey: sellerShelfQueryKeys.publicBySeller(sellerId),
    queryFn: () => fetchPublicSellerShelves(sellerId),
    enabled: isSessionReady && sellerId.length > 0,
  });
  const catalogQuery = useSellerProductsInfiniteQuery({
    sellerId,
    enabled: isSessionReady && sellerId.length > 0,
    shelfId: selectedShelfId,
  });

  useEffect(() => {
    setSelectedShelfId(null);
  }, [sellerId]);

  const seller = profileQuery.data as Record<string, unknown> | undefined;
  const isSelf = currentUserId != null && sellerId === currentUserId;
  const displayName =
    String(seller?.userName ?? "").trim() || USER_LIST_ROW_UI.MISSING_NAME;

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
        viewerRegionCode,
      }),
    [catalogQuery.products, productGrid.columns, viewerRegionCode],
  );

  const shelves = shelvesQuery.data?.shelves ?? [];

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

  const isFollowing = seller?.isFollowing === true;

  return (
    <CatalogScrollAnimationProvider>
      <View style={[styles.container, centeredContentStyle, { paddingTop: insets.top }]}>
        <CatalogAnimatedFlatList
          key={productGrid.listKey}
          style={styles.listFlex}
          data={catalogGridRows}
          keyExtractor={(item) => item.key}
          numColumns={1}
          contentContainerStyle={[
            styles.list,
            resolveCatalogGridListContentStyle(productGrid.gap),
            { paddingBottom: contentPaddingBottom + insets.bottom },
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
              <View style={styles.nav}>
                <Pressable
                  style={({ pressed }) => [styles.navBack, pressed ? styles.navBackPressed : null]}
                  onPress={() => navigateBackOrHome(router)}
                  accessibilityRole="button"
                  accessibilityLabel={SELLER_PRODUCTS_PAGE_UI.BACK_ARIA}
                  hitSlop={8}
                >
                  <Feather name="chevron-left" size={22} color={theme.colors.action} />
                </Pressable>
                <Text style={styles.navTitle} numberOfLines={1}>
                  {SELLER_PRODUCTS_PAGE_UI.TITLE}
                </Text>
              </View>

              {seller ? (
                <>
                  <ProfileOverviewBanner
                    user={seller}
                    bannerAction={
                      isSelf ? (
                        <SellerShareLinkButton
                          sellerId={sellerId}
                          sellerName={displayName}
                          variant="banner"
                        />
                      ) : null
                    }
                  />

                  <SellerProfileQuickStats
                    seller={seller}
                    userId={sellerId}
                    hidePhoneUntilReveal={!isSelf}
                  />

                  <View style={styles.sellerMetaZone}>
                    <View style={styles.sellerMetaNameHost}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.sellerMetaName,
                          pressed ? styles.sellerMetaNamePressed : null,
                        ]}
                        onPress={() => router.push(`/user/${sellerId}`)}
                        accessibilityRole="button"
                        accessibilityLabel={PRODUCT_CARD_UI.SELLER_PROFILE_ARIA(displayName)}
                      >
                        <UserPremiumDisplayName
                          name={displayName}
                          isPremium={seller.isPremiumUser === true}
                          isUserDataConfirmed={seller.isUserDataConfirmed === true}
                          textStyle={styles.sellerName}
                          singleLine
                        />
                      </Pressable>
                    </View>
                    {!isSelf ? (
                      <View style={styles.sellerMetaActions}>
                        <SellerShareLinkButton
                          sellerId={sellerId}
                          sellerName={displayName}
                          variant="meta"
                        />
                        <UserFollowButton
                          targetUserId={sellerId}
                          isFollowing={isFollowing}
                          isAuthorized={isAuthorized}
                          isSelf={isSelf}
                          layout="sellerMeta"
                          onFollowChange={handleFollowChange}
                        />
                      </View>
                    ) : null}
                  </View>

                  {shelves.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.shelvesRow}
                      accessibilityRole="toolbar"
                      accessibilityLabel={SELLER_PRODUCTS_PAGE_UI.SHELF_FILTER_ARIA}
                    >
                      <Pressable
                        onPress={() => setSelectedShelfId(null)}
                        style={[
                          styles.shelfChip,
                          selectedShelfId == null ? styles.shelfChipActive : null,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: selectedShelfId == null }}
                      >
                        <Text
                          style={[
                            styles.shelfChipText,
                            selectedShelfId == null ? styles.shelfChipTextActive : null,
                          ]}
                        >
                          {SELLER_PRODUCTS_PAGE_UI.SHELF_FILTER_ALL}
                        </Text>
                      </Pressable>
                      {shelves.map((shelf) => {
                        const active = selectedShelfId === shelf._id;
                        return (
                          <Pressable
                            key={shelf._id}
                            onPress={() => setSelectedShelfId(shelf._id)}
                            style={[styles.shelfChip, active ? styles.shelfChipActive : null]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                          >
                            <Text
                              style={[
                                styles.shelfChipText,
                                active ? styles.shelfChipTextActive : null,
                              ]}
                            >
                              {shelf.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  ) : null}
                </>
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
              contentWidth={productGrid.contentWidth}
              tileWidth={productGrid.tileWidth}
              rowIndex={index}
            />
          )}
        />
      </View>
    </CatalogScrollAnimationProvider>
  );
};
