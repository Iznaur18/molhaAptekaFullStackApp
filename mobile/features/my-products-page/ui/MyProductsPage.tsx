import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
} from "@/entities/product/lib/getProductModerationUi";
import { getSellerProductsLimit } from "@/entities/product/lib/sellerProductsLimit";
import { isSellerProductLoyaltyPointsOvercommitted } from "@/entities/product/lib/isSellerProductLoyaltyPointsOvercommitted";
import {
  CATALOG_SORT_NEWEST,
  type MyProductsCatalogSort,
  type MyProductsModerationFilter,
} from "@/entities/product/model/productConstants";
import { useMyProductsInfiniteQuery } from "@/entities/product/model/useMyProductsInfiniteQuery";
import { useMyProductsTotalQuery } from "@/entities/product/model/useMyProductsTotalQuery";
import { useProductPromotionTariffsQuery } from "@/entities/product/model/useProductPromotionTariffsQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { CatalogScrollAnimationProvider } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";
import { CatalogAnimatedFlatList } from "@/features/catalog-grid/ui/CatalogAnimatedFlatList";
import { MyProductsCatalogToolbar } from "@/features/my-products-catalog-toolbar/ui/MyProductsCatalogToolbar";
import { useMyProductsPageActions } from "@/features/my-products-page/model/useMyProductsPageActions";
import { MyProductsCatalogGridRowItem } from "@/features/my-products-page/ui/MyProductsCatalogGridRowItem";
import { usePlaceProductPress } from "@/features/place-product/model/usePlaceProductPress";
import { ProductPromotionModal } from "@/features/product-promotion/ui/ProductPromotionModal";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PRODUCTS_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout, type ProductGridLayoutResolvers } from "@/shared/model/useProductGridLayout";
import { resolveProductGridGap } from "@/shared/lib/screenBreakpoints";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useMyProductsPageStyles } from "@/shared/theme/sellerFlowStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const myProductsGridResolvers: ProductGridLayoutResolvers = {
  resolveColumns: () => 1,
  resolveGap: resolveProductGridGap,
};

export const MyProductsPage = () => {
  const router = useRouter();
  const styles = useMyProductsPageStyles();
  const productGrid = useProductGridLayout(undefined, myProductsGridResolvers);
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const { isAdmin } = useUserAccess();
  const placeProduct = usePlaceProductPress();
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const [catalogSort, setCatalogSort] = useState<MyProductsCatalogSort>(CATALOG_SORT_NEWEST);
  const [moderationFilter, setModerationFilter] = useState<MyProductsModerationFilter>("");

  const productsQuery = useMyProductsInfiniteQuery({
    enabled: isAuthorized,
    sort: catalogSort,
    moderationStatus: moderationFilter,
  });
  const myProductsTotalQuery = useMyProductsTotalQuery({ enabled: isAuthorized });
  const loyaltyPointsQuery = useMyLoyaltyPointsStatusQuery(isAuthorized);

  const sellerProductsLimit = useMemo(() => {
    if (isAdmin) {
      return null;
    }
    return getSellerProductsLimit(sessionQuery.data?.user);
  }, [isAdmin, sessionQuery.data?.user]);

  const myProductsTotal = myProductsTotalQuery.myProductsTotal;

  const pageActions = useMyProductsPageActions();
  const promotionTariffsQuery = useProductPromotionTariffsQuery(pageActions.promotionModalVisible);
  const promotionLoyaltyQuery = useMyLoyaltyPointsStatusQuery(
    pageActions.promotionModalVisible && isAuthorized,
  );

  const catalogGridRows = useMemo(
    () => buildCatalogGridRows(productsQuery.products, productGrid.columns, { isMineMode: true }),
    [productGrid.columns, productsQuery.products],
  );

  const loyaltyPointsBalance = loyaltyPointsQuery.data?.loyaltyPointsBalance ?? 0;
  const loyaltyPointsReserved = loyaltyPointsQuery.data?.loyaltyPointsReserved ?? 0;

  const resolveLoyaltyOvercommitted = useMemo(
    () => (product: Record<string, unknown> & { _id: string }) =>
      isSellerProductLoyaltyPointsOvercommitted(product, {
        loyaltyPointsBalance,
        loyaltyPointsReserved,
        sellerProducts: productsQuery.products,
      }),
    [loyaltyPointsBalance, loyaltyPointsReserved, productsQuery.products],
  );

  const emptyMessage =
    moderationFilter !== ""
      ? MY_PRODUCTS_PAGE_UI.EMPTY_BY_FILTER
      : MY_PRODUCTS_PAGE_UI.EMPTY;

  const promotionProduct = pageActions.promotionProduct;
  const promotionProductName = String(promotionProduct?.productName ?? "").trim() || "Без названия";
  const promotionProductPrice = Number(promotionProduct?.productPrice) || 0;

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{MY_PRODUCTS_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{MY_PRODUCTS_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (productsQuery.isPending) {
    return <ScreenLoadingState message={MY_PRODUCTS_PAGE_UI.LOADING} />;
  }

  if (productsQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          productsQuery.error,
          MY_PRODUCTS_PAGE_UI.FETCH_FALLBACK,
        )}
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  return (
    <>
      <CatalogScrollAnimationProvider>
        <CatalogAnimatedFlatList
        style={[styles.container, styles.listFlex, centeredContentStyle]}
        key={productGrid.listKey}
        data={catalogGridRows}
        keyExtractor={(item) => item.key}
        numColumns={1}
        contentContainerStyle={[
          styles.list,
          resolveCatalogGridListContentStyle(productGrid.gap),
          { paddingBottom: contentPaddingBottom },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <ProfileMobileSectionToggle
              activeLabel={MY_PROFILE_PAGE_UI.TAB_MY_PRODUCTS}
              onPress={() => setNavSheetVisible(true)}
            />

            <MyProductsCatalogToolbar
              catalogSort={catalogSort}
              onCatalogSortChange={(value) => setCatalogSort(value as MyProductsCatalogSort)}
              moderationFilter={moderationFilter}
              onModerationFilterChange={(value) =>
                setModerationFilter(value as MyProductsModerationFilter)
              }
              myProductsTotal={myProductsTotal}
              sellerProductsLimit={sellerProductsLimit}
              isAdmin={isAdmin}
            />

            {pageActions.catalogNotice ? (
              <Text style={[styles.banner, styles.noticeBanner]} accessibilityRole="text">
                {pageActions.catalogNotice}
              </Text>
            ) : null}
            {pageActions.catalogError ? (
              <Text style={[styles.banner, styles.errorBanner]} accessibilityRole="alert">
                {pageActions.catalogError}
              </Text>
            ) : null}
          </View>
        }
        refreshControl={
          <ThemedRefreshControl
            refreshing={productsQuery.isRefetching}
            onRefresh={() => {
              void productsQuery.refetch();
              void myProductsTotalQuery.refetch();
            }}
          />
        }
        onEndReached={() => {
          if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
            void productsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.hint}>{emptyMessage}</Text>
            <Pressable style={styles.button} onPress={placeProduct.handlePlaceProductPress}>
              <Text style={styles.buttonText}>{MY_PRODUCTS_PAGE_UI.CREATE_BUTTON}</Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={
          productsQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
        renderItem={({ item, index }) => (
          <MyProductsCatalogGridRowItem
            row={item}
            columns={productGrid.columns}
            gap={productGrid.gap}
            tileWidth={productGrid.tileWidth}
            rowIndex={index}
            onEditProduct={pageActions.handleEditProduct}
            onPromoteProduct={pageActions.handlePromoteProduct}
            resolveLoyaltyOvercommitted={resolveLoyaltyOvercommitted}
          />
        )}
        />
      </CatalogScrollAnimationProvider>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="my-products"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />

      <ProductPromotionModal
        visible={pageActions.promotionModalVisible}
        product={promotionProduct}
        productName={promotionProductName}
        productPrice={promotionProductPrice}
        tiers={promotionTariffsQuery.data?.tiers ?? []}
        durations={promotionTariffsQuery.data?.durations ?? []}
        loyaltyPoints={promotionLoyaltyQuery.data?.loyaltyPointsBalance ?? 0}
        isTariffsLoading={promotionTariffsQuery.isPending}
        tariffsError={
          promotionTariffsQuery.error instanceof Error ? promotionTariffsQuery.error : null
        }
        isSubmitting={pageActions.isPromotionSubmitting}
        errorMessage={pageActions.promotionErrorMessage}
        onRetryTariffs={() => void promotionTariffsQuery.refetch()}
        onClose={pageActions.handleClosePromotionModal}
        onSubmit={pageActions.handleSubmitPromotion}
        onSetProductAvailability={pageActions.handleSetMyProductAvailability}
        onSetProductAuction={pageActions.handleSetProductAuction}
        onSetProductOriginality={pageActions.handleSetProductOriginality}
        onSetProductWholesale={pageActions.handleSetProductWholesale}
        onSetProductRental={pageActions.handleSetProductRental}
        onSetProductAffiliate={pageActions.handleSetProductAffiliate}
        onSetProductInstallment={pageActions.handleSetProductInstallment}
        onWholesaleSaved={pageActions.handleWholesaleSaved}
        onDeleteProduct={pageActions.handleDeleteProduct}
        isAvailabilityTogglePending={pageActions.isAvailabilityTogglePending}
        isAuctionTogglePending={pageActions.isAuctionTogglePending}
        isOriginalityTogglePending={pageActions.isOriginalityTogglePending}
        isWholesaleTogglePending={pageActions.isWholesaleTogglePending}
        isRentalTogglePending={pageActions.isRentalTogglePending}
        isAffiliateTogglePending={pageActions.isAffiliateTogglePending}
        isInstallmentTogglePending={pageActions.isInstallmentTogglePending}
        isDeletePending={pageActions.isDeletePending}
        manageErrorMessage={pageActions.manageErrorMessage}
        canManageEdit={
          promotionProduct != null && (isAdmin || canSellerEditProduct(promotionProduct))
        }
        canManageDelete={
          promotionProduct != null && (isAdmin || canSellerDeleteProduct(promotionProduct))
        }
        canManageToggleVisibility={
          promotionProduct != null &&
          (isAdmin || canSellerToggleCatalogVisibility(promotionProduct))
        }
        sellerRaffleActive={pageActions.sellerRaffleActive}
        onToggleRaffleParticipation={pageActions.handleToggleRaffleParticipation}
        isRaffleParticipationPending={pageActions.isRaffleParticipationPending}
        onInstallmentProgramSaved={pageActions.handleInstallmentProgramSaved}
      />
    </>
  );
};
