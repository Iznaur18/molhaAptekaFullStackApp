import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { resolveProductPreviewVideoUrl } from "@/entities/product/lib/resolveProductPreviewVideoUrl";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
} from "@/entities/product/lib/getProductModerationUi";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { useCatalogProductQuery } from "@/entities/product/model/useCatalogProductQuery";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { useProductDetailTabs } from "@/entities/product/model/useProductDetailTabs";
import { useProductPromotionTariffsQuery } from "@/entities/product/model/useProductPromotionTariffsQuery";
import { useRecordProductViewMutation } from "@/entities/product/model/useRecordProductViewMutation";
import { useRequestProductPromotionMutation } from "@/entities/product/model/useRequestProductPromotionMutation";
import { useMyProductReportStatusQuery } from "@/entities/product-report/model/useMyProductReportStatusQuery";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { ProductDetailPurchaseActions } from "@/features/product-detail/ui/ProductDetailPurchaseActions";
import { ProductDetailMediaSection } from "@/features/product-detail/ui/ProductDetailMediaSection";
import { ProductDetailTabBar } from "@/features/product-detail/ui/ProductDetailTabBar";
import { ProductDetailsDetailsTab } from "@/features/product-detail/ui/ProductDetailsDetailsTab";
import { ProductAuctionTab, type ProductAuctionDockFooter } from "@/features/product-detail/ui/ProductAuctionTab";
import { ProductInstallmentTab, type ProductInstallmentDockFooter } from "@/features/product-detail/ui/ProductInstallmentTab";
import { ProductReviewsTab } from "@/features/product-detail/ui/ProductReviewsTab";
import {
  isProductSimilarScrollNearEnd,
  ProductSimilarTab,
} from "@/features/product-detail/ui/ProductSimilarTab";
import { ProductPromotionModal } from "@/features/product-promotion/ui/ProductPromotionModal";
import { SquircleView } from "@/shared/ui/SquircleView";
import { useProductPromotionManageSupport } from "@/features/product-promotion/model/useProductPromotionManageSupport";
import { ReportProductModal } from "@/features/product-report/ui/ReportProductModal";
import { catalogQueryKeys, loyaltyPointsQueryKeys, myProductsQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  INSTALLMENT_UI,
  PRODUCT_CARD_UI,
  PRODUCT_PROMOTION_UI,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { confirmDestructiveAction } from "@/shared/lib/confirmDestructiveAction";
import { formatApiErrorMessage } from "@/shared/lib";
import { useVisualViewportKeyboardBottomInset } from "@/shared/lib/useVisualViewportKeyboardBottomInset";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { PRODUCT_DETAIL_PURCHASE_DOCK_TOP_RADIUS, useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useProductDetailScreenStyles();
  const { centeredContentStyle } = useScreenLayout();
  const queryClient = useQueryClient();
  const keyboardBottomInset = useVisualViewportKeyboardBottomInset();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id ?? "";
  const productQuery = useCatalogProductQuery(productId);
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const recordViewMutation = useRecordProductViewMutation();
  const recordProductViewRef = useRef(recordViewMutation.mutate);
  recordProductViewRef.current = recordViewMutation.mutate;
  const requestPromotionMutation = useRequestProductPromotionMutation();
  const { patchMutation, deleteMutation } = useMyProductMutations();
  const { isAdmin } = useUserAccess();
  const reportStatusQuery = useMyProductReportStatusQuery({
    productId,
    enabled: isAuthorized,
  });
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [installmentDock, setInstallmentDock] = useState<ProductInstallmentDockFooter | null>(
    null,
  );
  const [auctionDock, setAuctionDock] = useState<ProductAuctionDockFooter | null>(null);
  const [promotionErrorMessage, setPromotionErrorMessage] = useState("");
  const [manageErrorMessage, setManageErrorMessage] = useState("");
  const [isAvailabilityTogglePending, setIsAvailabilityTogglePending] = useState(false);
  const [isAuctionTogglePending, setIsAuctionTogglePending] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState("");
  const [viewerCount, setViewerCount] = useState<number | null>(null);

  const promotionTariffsQuery = useProductPromotionTariffsQuery(promotionModalVisible);
  const loyaltyPointsQuery = useMyLoyaltyPointsStatusQuery(
    promotionModalVisible && isAuthorized,
  );

  const product = productQuery.data as Record<string, unknown> | undefined;
  const currentUserId = sessionQuery.data?.user?._id ?? null;

  const syncPromotionProduct = useCallback(
    (updated: Record<string, unknown> & { _id: string }) => {
      queryClient.setQueryData(catalogQueryKeys.product(productId), (prev) =>
        prev && typeof prev === "object" ? { ...(prev as Record<string, unknown>), ...updated } : prev,
      );
    },
    [productId, queryClient],
  );

  const {
    activeTab,
    setActiveTab,
    tabs,
    showTabs,
    isOwnProduct,
    auctionUi,
    installmentActive,
    topStatFieldKeys,
    handleAuctionShortcut,
    handleInstallmentShortcut,
  } = useProductDetailTabs({
    product,
    currentUserId,
  });

  const promotionProduct =
    isOwnProduct && product?._id != null
      ? (product as Record<string, unknown> & { _id: string })
      : null;

  const manageSupport = useProductPromotionManageSupport({
    product: promotionProduct,
    syncProduct: syncPromotionProduct,
    setManageErrorMessage,
    enabled: promotionModalVisible && isOwnProduct,
  });

  useEffect(() => {
    if (!isAuthorized || !productId || isOwnProduct) {
      return;
    }
    recordProductViewRef.current(productId, {
      onSuccess: (result) => {
        setViewerCount(result.uniqueViewerCount);
      },
    });
  }, [isAuthorized, isOwnProduct, productId]);

  const handleInstallmentDockChange = useCallback((footer: ProductInstallmentDockFooter | null) => {
    setInstallmentDock((prev) => {
      if (footer === null) {
        return prev === null ? prev : null;
      }
      if (prev !== null && prev.disabled === footer.disabled && prev.label === footer.label) {
        return prev;
      }
      return footer;
    });
  }, []);

  const handleAuctionDockChange = useCallback((footer: ProductAuctionDockFooter | null) => {
    setAuctionDock((prev) => {
      if (footer === null) {
        return prev === null ? prev : null;
      }
      if (prev !== null && prev.disabled === footer.disabled && prev.label === footer.label) {
        return prev;
      }
      return footer;
    });
  }, []);

  useEffect(() => {
    if (activeTab !== "installment") {
      setInstallmentDock(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "auction") {
      setAuctionDock(null);
    }
  }, [activeTab]);

  const handleClosePromotionModal = useCallback(() => {
    setPromotionModalVisible(false);
    setPromotionErrorMessage("");
    setManageErrorMessage("");
  }, []);

  const handleInstallmentProgramSaved = useCallback(
    async (productPatch?: Record<string, unknown>) => {
      manageSupport.handleInstallmentProgramSaved(productPatch);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: myProductsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all }),
      ]);
      handleClosePromotionModal();
      router.replace("/hub/my-products");
    },
    [handleClosePromotionModal, manageSupport, queryClient, router],
  );

  const isSimilarTab = activeTab === "similar";
  const similarLoadMoreRef = useRef<(() => void) | null>(null);
  const similarLoadMoreLockUntilRef = useRef(0);

  const handleRegisterSimilarLoadMore = useCallback((loadMore: (() => void) | null) => {
    similarLoadMoreRef.current = loadMore;
  }, []);

  const handleProductScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isSimilarTab) {
        return;
      }
      const now = Date.now();
      if (now < similarLoadMoreLockUntilRef.current) {
        return;
      }
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      if (
        isProductSimilarScrollNearEnd({
          contentOffsetY: contentOffset.y,
          contentHeight: contentSize.height,
          layoutHeight: layoutMeasurement.height,
        })
      ) {
        similarLoadMoreLockUntilRef.current = now + 800;
        similarLoadMoreRef.current?.();
      }
    },
    [isSimilarTab],
  );

  if (productQuery.isPending) {
    return <ScreenLoadingState />;
  }

  if (productQuery.isError || !product) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          productQuery.error,
          API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK,
        )}
        onRetry={() => productQuery.refetch()}
      />
    );
  }

  const productRecord: Record<string, unknown> = {
    ...(product as Record<string, unknown>),
    ...(viewerCount != null ? { uniqueViewerCount: viewerCount } : {}),
  };

  const imageUrls = resolveProductImageUrls(productRecord);
  const previewVideoUrl = resolveProductPreviewVideoUrl(productRecord);
  const name = String(productRecord.productName ?? "").trim() || "Без названия";
  const isAvailable = productRecord.productIsAvailable !== false;
  const hasPendingReport = reportStatusQuery.data?.hasPendingReport ?? false;
  const loyaltyPointsBalance = loyaltyPointsQuery.data?.loyaltyPointsBalance ?? 0;
  const productPrice = Number(productRecord.productPrice) || 0;
  const purchaseLimit = getProductPurchaseLimit(productRecord);
  const canShowAddToCart = !isOwnProduct && isAvailable && purchaseLimit > 0;
  const showManageActions = (isOwnProduct || isAdmin) && activeTab === "details";
  const hasOpenSalesLocked = productRecord.hasOpenSales === true;
  const showMobilePurchaseDock =
    activeTab === "details" && (canShowAddToCart || auctionUi.auctionActive || installmentActive);
  const showInstallmentDock = activeTab === "installment" && installmentDock != null;
  const showAuctionDock = activeTab === "auction" && auctionDock != null;
  const isAltTab =
    activeTab === "reviews" ||
    activeTab === "similar" ||
    activeTab === "auction" ||
    activeTab === "installment";

  const handleAdminDelete = () => {
    if (!isAdmin || hasOpenSalesLocked || deleteMutation.isPending) {
      return;
    }
    confirmDestructiveAction({
      title: PRODUCT_CARD_UI.DELETE_PRODUCT,
      message: PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION,
      confirmLabel: PRODUCT_CARD_UI.DELETE_CONFIRM_YES,
      cancelLabel: PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteMutation.mutateAsync(productId);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)");
            }
          } catch (error) {
            Alert.alert(
              PRODUCT_CARD_UI.DELETE_PRODUCT,
              formatApiErrorMessage(error, API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK),
            );
          }
        })();
      },
    });
  };

  const handleReportPress = () => {
    if (!isAuthorized) {
      router.push("/(auth)/login");
      return;
    }
    setReportSuccessMessage("");
    setReportModalVisible(true);
  };

  const handleReportSubmitted = () => {
    setReportSuccessMessage(PRODUCT_REPORT_UI.SUCCESS);
    void reportStatusQuery.refetch();
  };

  const handleOpenPromotionModal = () => {
    setPromotionErrorMessage("");
    setManageErrorMessage("");
    setPromotionModalVisible(true);
  };

  const handleSubmitPromotion = async (tier: number, tariffCode: string) => {
    setPromotionErrorMessage("");
    try {
      const result = await requestPromotionMutation.mutateAsync({
        productId,
        tier,
        tariffCode,
      });
      await Promise.all([
        productQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.status() }),
        queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all }),
      ]);
      handleClosePromotionModal();
      Alert.alert(result.message ?? PRODUCT_PROMOTION_UI.SUCCESS_DEFAULT);
    } catch (error) {
      setPromotionErrorMessage(
        error instanceof Error
          ? error.message
          : API_CLIENT_UI.REQUEST_PRODUCT_PROMOTION_FALLBACK,
      );
    }
  };

  const handleSetMyProductAvailability = async (
    targetProductId: string,
    isAvailable: boolean,
  ) => {
    setIsAvailabilityTogglePending(true);
    setManageErrorMessage("");
    try {
      const updated = await patchMutation.mutateAsync({
        productId: targetProductId,
        body: { productIsAvailable: isAvailable },
      });
      syncPromotionProduct(updated as Record<string, unknown> & { _id: string });
    } catch (error) {
      setManageErrorMessage(
        error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
      );
    } finally {
      setIsAvailabilityTogglePending(false);
    }
  };

  const handleSetProductAuction = async (
    targetProductId: string,
    auctionEnabled: boolean,
  ) => {
    setIsAuctionTogglePending(true);
    setManageErrorMessage("");
    try {
      const updated = await patchMutation.mutateAsync({
        productId: targetProductId,
        body: { productAuctionEnabled: auctionEnabled },
      });
      syncPromotionProduct(updated as Record<string, unknown> & { _id: string });
    } catch (error) {
      setManageErrorMessage(
        error instanceof Error ? error.message : API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK,
      );
    } finally {
      setIsAuctionTogglePending(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.scrollArea, centeredContentStyle]}>
        <KeyboardAvoidingView
          style={styles.scrollArea}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.container,
              !showMobilePurchaseDock &&
                !showInstallmentDock &&
                !showAuctionDock &&
                styles.containerNoDock,
              keyboardBottomInset > 0 ? { paddingBottom: keyboardBottomInset } : null,
            ]}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS !== "web"}
            automaticallyAdjustsScrollIndicatorInsets={Platform.OS !== "web"}
            onScroll={handleProductScroll}
            scrollEventThrottle={16}
          >
            <ProductDetailMediaSection
              product={productRecord}
              productId={productId}
              imageUrls={imageUrls}
              previewVideoUrl={previewVideoUrl}
              isOwnProduct={isOwnProduct}
              onReportPress={handleReportPress}
              reportDisabled={isAuthorized && hasPendingReport}
            />
            {showTabs ? (
              <ProductDetailTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            ) : null}

            {isSimilarTab ? (
              <ProductSimilarTab
                product={productRecord}
                excludeProductId={productId}
                enabled
                onRegisterLoadMore={handleRegisterSimilarLoadMore}
              />
            ) : null}

            <View
              style={[
                styles.tabPanel,
                isAltTab && styles.tabPanelInset,
                isSimilarTab && styles.productTabPanelHidden,
              ]}
              pointerEvents={isSimilarTab ? "none" : "auto"}
              collapsable={false}
            >
              {activeTab === "details" ? (
                <ProductDetailsDetailsTab
                  product={productRecord}
                  topStatFieldKeys={topStatFieldKeys}
                  onOpenInstallmentTab={handleInstallmentShortcut}
                  onOpenAuctionTab={handleAuctionShortcut}
                  auctionActive={auctionUi.auctionActive}
                />
              ) : null}
              {activeTab === "reviews" ? (
                <ProductReviewsTab
                  productId={productId}
                  isAuthorized={isAuthorized}
                  isUserDataConfirmed={sessionQuery.data?.user?.isUserDataConfirmed === true}
                  isOwnProduct={isOwnProduct}
                />
              ) : null}
              {activeTab === "auction" ? (
                <ProductAuctionTab
                  productId={productId}
                  auctionActive={auctionUi.auctionActive}
                  completedOnce={auctionUi.completedOnce}
                  isAuthorized={isAuthorized}
                  isUserDataConfirmed={sessionQuery.data?.user?.isUserDataConfirmed === true}
                  isOwnProduct={isOwnProduct}
                  onDockFooterChange={handleAuctionDockChange}
                />
              ) : null}
              {activeTab === "installment" ? (
                <ProductInstallmentTab
                  productId={productId}
                  productPrice={productPrice}
                  installmentEnabled={productRecord.productInstallmentEnabled === true}
                  isAuthorized={isAuthorized}
                  isUserDataConfirmed={sessionQuery.data?.user?.isUserDataConfirmed === true}
                  isOwnProduct={isOwnProduct}
                  defaultUser={sessionQuery.data?.user ?? null}
                  onDockFooterChange={handleInstallmentDockChange}
                />
              ) : null}
            </View>

            {showManageActions ? (
              <View style={styles.mobileInlineActions}>
                {isOwnProduct ? (
                  <AppButton
                    label={PRODUCT_CARD_UI.PROMOTION_BUTTON}
                    variant="contrast"
                    onPress={handleOpenPromotionModal}
                    disabled={deleteMutation.isPending}
                    style={styles.sellerActionButton}
                  />
                ) : null}
                {isOwnProduct || isAdmin ? (
                  <AppButton
                    label={PRODUCT_CARD_UI.EDIT_PRODUCT}
                    variant="outline"
                    onPress={() => router.push(`/edit-product/${productId}`)}
                    disabled={deleteMutation.isPending}
                    style={styles.sellerActionButton}
                  />
                ) : null}
                {isAdmin ? (
                  <AppButton
                    label={
                      deleteMutation.isPending
                        ? PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING
                        : PRODUCT_CARD_UI.DELETE_PRODUCT
                    }
                    variant="outline"
                    onPress={handleAdminDelete}
                    disabled={hasOpenSalesLocked || deleteMutation.isPending}
                    style={styles.sellerActionButton}
                  />
                ) : null}
                {hasOpenSalesLocked && isAdmin ? (
                  <Text style={styles.reportSuccess}>{PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}</Text>
                ) : null}
              </View>
            ) : null}

            {reportSuccessMessage ? (
              <Text style={styles.reportSuccess}>{reportSuccessMessage}</Text>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>

        {showMobilePurchaseDock && keyboardBottomInset === 0 ? (
          <SquircleView
            radius={PRODUCT_DETAIL_PURCHASE_DOCK_TOP_RADIUS}
            outerStyle={styles.purchaseDock}
            style={[styles.purchaseDockInner, { paddingBottom: Math.max(insets.bottom, 10.4) }]}
          >
            <ProductDetailPurchaseActions
              productId={productId}
              product={productRecord}
              canShowAddToCart={canShowAddToCart}
              variant="dock"
            />
          </SquircleView>
        ) : null}

        {showInstallmentDock && installmentDock && keyboardBottomInset === 0 ? (
          <View style={[styles.installmentDock, { paddingBottom: Math.max(insets.bottom, 10.4) }]}>
            <AppButton
              label={installmentDock.label}
              variant="primary"
              onPress={installmentDock.onSubmit}
              disabled={installmentDock.disabled}
              style={styles.installmentDockButton}
              accessibilityLabel={INSTALLMENT_UI.SUBMIT}
            />
          </View>
        ) : null}

        {showAuctionDock && auctionDock && keyboardBottomInset === 0 ? (
          <View style={[styles.installmentDock, { paddingBottom: Math.max(insets.bottom, 10.4) }]}>
            <AppButton
              label={auctionDock.label}
              variant="primary"
              onPress={auctionDock.onSubmit}
              disabled={auctionDock.disabled}
              style={styles.installmentDockButton}
              accessibilityLabel={auctionDock.label}
            />
          </View>
        ) : null}
      </View>

      <ReportProductModal
        visible={reportModalVisible}
        productId={productId}
        productName={name}
        hasPendingReport={hasPendingReport}
        onClose={() => setReportModalVisible(false)}
        onSubmitted={handleReportSubmitted}
      />

      <ProductPromotionModal
        visible={promotionModalVisible}
        product={isOwnProduct ? (productRecord as Record<string, unknown> & { _id: string }) : null}
        productName={name}
        productPrice={productPrice}
        tiers={promotionTariffsQuery.data?.tiers ?? []}
        durations={promotionTariffsQuery.data?.durations ?? []}
        loyaltyPoints={loyaltyPointsBalance}
        isTariffsLoading={promotionTariffsQuery.isPending}
        tariffsError={
          promotionTariffsQuery.error instanceof Error ? promotionTariffsQuery.error : null
        }
        isSubmitting={requestPromotionMutation.isPending}
        errorMessage={promotionErrorMessage}
        onRetryTariffs={() => void promotionTariffsQuery.refetch()}
        onClose={handleClosePromotionModal}
        onSubmit={handleSubmitPromotion}
        onSetProductAvailability={isOwnProduct ? handleSetMyProductAvailability : undefined}
        onSetProductAuction={isOwnProduct ? handleSetProductAuction : undefined}
        onDeleteProduct={
          isOwnProduct || isAdmin
            ? async (id) => {
                try {
                  await deleteMutation.mutateAsync(id);
                  handleClosePromotionModal();
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/(tabs)");
                  }
                } catch (error) {
                  setManageErrorMessage(
                    formatApiErrorMessage(error, API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK),
                  );
                }
              }
            : undefined
        }
        isAvailabilityTogglePending={isAvailabilityTogglePending}
        isAuctionTogglePending={isAuctionTogglePending}
        isDeletePending={deleteMutation.isPending}
        manageErrorMessage={manageErrorMessage}
        canManageEdit={
          (isOwnProduct || isAdmin) && (isAdmin || canSellerEditProduct(productRecord))
        }
        canManageDelete={
          (isOwnProduct || isAdmin) && (isAdmin || canSellerDeleteProduct(productRecord))
        }
        canManageToggleVisibility={
          isOwnProduct && (isAdmin || canSellerToggleCatalogVisibility(productRecord))
        }
        sellerRaffleActive={manageSupport.sellerRaffleActive}
        onToggleRaffleParticipation={manageSupport.handleToggleRaffleParticipation}
        isRaffleParticipationPending={manageSupport.isRaffleParticipationPending}
        onInstallmentProgramSaved={handleInstallmentProgramSaved}
      />
    </View>
  );
}
