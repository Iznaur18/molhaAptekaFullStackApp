import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
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
import { isCatalogPromotionActive } from "@/entities/product/lib/productPromotionStatus";
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
import { ProductDetailTabBar } from "@/features/product-detail/ui/ProductDetailTabBar";
import { ProductDetailsDetailsTab } from "@/features/product-detail/ui/ProductDetailsDetailsTab";
import { ProductAuctionTab, type ProductAuctionDockFooter } from "@/features/product-detail/ui/ProductAuctionTab";
import { ProductInstallmentTab, type ProductInstallmentDockFooter } from "@/features/product-detail/ui/ProductInstallmentTab";
import { ProductReviewsTab } from "@/features/product-detail/ui/ProductReviewsTab";
import { ProductPromotionModal } from "@/features/product-promotion/ui/ProductPromotionModal";
import { useProductPromotionManageSupport } from "@/features/product-promotion/model/useProductPromotionManageSupport";
import { ReportProductModal } from "@/features/product-report/ui/ReportProductModal";
import { catalogQueryKeys, loyaltyPointsQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  CREATE_PRODUCT_UI,
  INSTALLMENT_UI,
  PRODUCT_CARD_UI,
  PRODUCT_PROMOTION_UI,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useProductDetailScreenStyles();
  const queryClient = useQueryClient();
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
  const [isDeletePending, setIsDeletePending] = useState(false);
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
  const isPromotionActive = isCatalogPromotionActive(productRecord);
  const canPromoteProduct =
    isOwnProduct && isAvailable && !isPromotionActive && isAuthorized;
  const loyaltyPointsBalance = loyaltyPointsQuery.data?.loyaltyPointsBalance ?? 0;
  const productPrice = Number(productRecord.productPrice) || 0;
  const purchaseLimit = getProductPurchaseLimit(productRecord);
  const canShowAddToCart = !isOwnProduct && isAvailable && purchaseLimit > 0;
  const showMobilePurchaseDock =
    activeTab === "details" && (canShowAddToCart || auctionUi.auctionActive || installmentActive);
  const showInstallmentDock = activeTab === "installment" && installmentDock != null;
  const showAuctionDock = activeTab === "auction" && auctionDock != null;
  const isAltTab = activeTab === "reviews" || activeTab === "auction" || activeTab === "installment";

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

  const handleClosePromotionModal = () => {
    setPromotionModalVisible(false);
    setPromotionErrorMessage("");
    setManageErrorMessage("");
    manageSupport.closeInstallmentProgramModal();
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

  const handleDeleteMyProduct = async (targetProductId: string) => {
    setIsDeletePending(true);
    setManageErrorMessage("");
    try {
      await deleteMutation.mutateAsync(targetProductId);
      handleClosePromotionModal();
      Alert.alert(CREATE_PRODUCT_UI.DELETE_SUCCESS);
      router.back();
    } catch (error) {
      setManageErrorMessage(
        error instanceof Error ? error.message : API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK,
      );
    } finally {
      setIsDeletePending(false);
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
      {showTabs ? (
        <ProductDetailTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      ) : null}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.container,
          !showMobilePurchaseDock && !showInstallmentDock && !showAuctionDock && styles.containerNoDock,
        ]}
      >
        <View style={[styles.tabPanel, isAltTab && styles.tabPanelInset]}>
          {activeTab === "details" ? (
            <ProductDetailsDetailsTab
              product={productRecord}
              productId={productId}
              imageUrls={imageUrls}
              previewVideoUrl={previewVideoUrl}
              isOwnProduct={isOwnProduct}
              topStatFieldKeys={topStatFieldKeys}
              onReportPress={handleReportPress}
              reportDisabled={isAuthorized && hasPendingReport}
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
              installmentEnabled={productRecord.productInstallmentEnabled === true}
              isAuthorized={isAuthorized}
              isUserDataConfirmed={sessionQuery.data?.user?.isUserDataConfirmed === true}
              isOwnProduct={isOwnProduct}
              defaultUser={sessionQuery.data?.user ?? null}
              onDockFooterChange={handleInstallmentDockChange}
            />
          ) : null}
        </View>

        {isOwnProduct && activeTab === "details" ? (
          <View style={styles.mobileInlineActions}>
            <AppButton
              label={PRODUCT_CARD_UI.PROMOTION_BUTTON}
              variant="contrast"
              onPress={handleOpenPromotionModal}
              disabled={!canPromoteProduct}
              style={[styles.sellerActionButton, !canPromoteProduct && styles.promoteButtonDisabled]}
            />
            <AppButton
              label={PRODUCT_CARD_UI.EDIT_PRODUCT}
              variant="outline"
              onPress={() => router.push(`/edit-product/${productId}`)}
              style={styles.sellerActionButton}
            />
          </View>
        ) : null}

        {reportSuccessMessage ? (
          <Text style={styles.reportSuccess}>{reportSuccessMessage}</Text>
        ) : null}
      </ScrollView>

      {showMobilePurchaseDock ? (
        <View style={[styles.purchaseDock, { paddingBottom: Math.max(insets.bottom, 10.4) }]}>
          <ProductDetailPurchaseActions
            productId={productId}
            product={productRecord}
            canShowAddToCart={canShowAddToCart}
            auctionActive={auctionUi.auctionActive}
            installmentActive={installmentActive}
            onAuctionPress={handleAuctionShortcut}
            onInstallmentPress={handleInstallmentShortcut}
            variant="dock"
          />
        </View>
      ) : null}

      {showInstallmentDock && installmentDock ? (
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

      {showAuctionDock && auctionDock ? (
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
        onDeleteProduct={isOwnProduct ? handleDeleteMyProduct : undefined}
        onSetProductAvailability={isOwnProduct ? handleSetMyProductAvailability : undefined}
        onSetProductAuction={isOwnProduct ? handleSetProductAuction : undefined}
        isDeletePending={isDeletePending}
        isAvailabilityTogglePending={isAvailabilityTogglePending}
        isAuctionTogglePending={isAuctionTogglePending}
        manageErrorMessage={manageErrorMessage}
        canManageEdit={isOwnProduct && (isAdmin || canSellerEditProduct(productRecord))}
        canManageDelete={isOwnProduct && (isAdmin || canSellerDeleteProduct(productRecord))}
        canManageToggleVisibility={
          isOwnProduct && (isAdmin || canSellerToggleCatalogVisibility(productRecord))
        }
        sellerRaffleActive={manageSupport.sellerRaffleActive}
        onToggleRaffleParticipation={manageSupport.handleToggleRaffleParticipation}
        isRaffleParticipationPending={manageSupport.isRaffleParticipationPending}
        onOpenInstallmentProgram={manageSupport.openInstallmentProgramModal}
        installmentProgramModalVisible={manageSupport.installmentProgramModalVisible}
        onCloseInstallmentProgram={manageSupport.closeInstallmentProgramModal}
        onInstallmentProgramSaved={manageSupport.handleInstallmentProgramSaved}
      />
    </View>
  );
}
