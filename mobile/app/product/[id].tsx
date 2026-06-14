import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { resolveProductPreviewVideoUrl } from "@/entities/product/lib/resolveProductPreviewVideoUrl";
import { PRODUCT_DETAILS_TOP_ROW_FIELD_KEYS } from "@/entities/product/lib/productFieldRegistry";
import { isCatalogPromotionActive } from "@/entities/product/lib/productPromotionStatus";
import { useCatalogProductQuery } from "@/entities/product/model/useCatalogProductQuery";
import { useProductDetailTabs } from "@/entities/product/model/useProductDetailTabs";
import { useProductPromotionTariffsQuery } from "@/entities/product/model/useProductPromotionTariffsQuery";
import { useRecordProductViewMutation } from "@/entities/product/model/useRecordProductViewMutation";
import { useRequestProductPromotionMutation } from "@/entities/product/model/useRequestProductPromotionMutation";
import { useMyProductReportStatusQuery } from "@/entities/product-report/model/useMyProductReportStatusQuery";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
import { ProductDetailFieldRows } from "@/entities/product/ui/ProductDetailFieldRows";
import { ProductMediaGallery } from "@/entities/product/ui/ProductMediaGallery";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "@/entities/product/ui/ProductPriceDisplay";
import { ProductSellerPreview } from "@/entities/product/ui/ProductSellerPreview";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { ProductAuctionTab } from "@/features/product-detail/ui/ProductAuctionTab";
import { ProductDetailTabBar } from "@/features/product-detail/ui/ProductDetailTabBar";
import { ProductInstallmentTab } from "@/features/product-detail/ui/ProductInstallmentTab";
import { ProductReviewsTab } from "@/features/product-detail/ui/ProductReviewsTab";
import { ProductPromotionModal } from "@/features/product-promotion/ui/ProductPromotionModal";
import { ReportProductModal } from "@/features/product-report/ui/ReportProductModal";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { catalogQueryKeys, loyaltyPointsQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  PRODUCT_CARD_UI,
  PRODUCT_DETAILS_MODAL_UI,
  PRODUCT_PROMOTION_UI,
  PRODUCT_REPORT_UI,
  PRODUCT_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProductDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id ?? "";
  const productQuery = useCatalogProductQuery(productId);
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const { isPremiumUser } = useUserAccess();
  const recordViewMutation = useRecordProductViewMutation();
  const requestPromotionMutation = useRequestProductPromotionMutation();
  const reportStatusQuery = useMyProductReportStatusQuery({
    productId,
    enabled: isAuthorized,
  });
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [promotionErrorMessage, setPromotionErrorMessage] = useState("");
  const [reportSuccessMessage, setReportSuccessMessage] = useState("");
  const [viewerCount, setViewerCount] = useState<number | null>(null);

  const promotionTariffsQuery = useProductPromotionTariffsQuery(promotionModalVisible);
  const loyaltyPointsQuery = useMyLoyaltyPointsStatusQuery(
    promotionModalVisible && isAuthorized,
  );

  const product = productQuery.data as Record<string, unknown> | undefined;
  const currentUserId = sessionQuery.data?.user?._id ?? null;

  const { activeTab, setActiveTab, tabs, showTabs, isOwnProduct, auctionUi } =
    useProductDetailTabs({
      product,
      currentUserId,
    });

  const topStatFieldKeys = useMemo(() => {
    const keys = [...PRODUCT_DETAILS_TOP_ROW_FIELD_KEYS];
    if (isOwnProduct) {
      return keys.filter((key) => key !== "productWishlistCount");
    }
    return keys;
  }, [isOwnProduct]);

  useEffect(() => {
    if (!isAuthorized || !productId || isOwnProduct) {
      return;
    }
    recordViewMutation.mutate(productId, {
      onSuccess: (result) => {
        setViewerCount(result.uniqueViewerCount);
      },
    });
  }, [isAuthorized, isOwnProduct, productId, recordViewMutation]);

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
  const rawDescription = productRecord.productDescription;
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";
  const hasPendingReport = reportStatusQuery.data?.hasPendingReport ?? false;
  const averageRating = Number(productRecord.averageRating);
  const reviewCount = Number(productRecord.reviewCount);
  const showRating =
    Number.isFinite(averageRating) && Number.isFinite(reviewCount) && reviewCount > 0;
  const isPromotionActive = isCatalogPromotionActive(productRecord);
  const canPromoteProduct =
    isOwnProduct && isAvailable && !isPromotionActive && isAuthorized;
  const loyaltyPointsBalance = loyaltyPointsQuery.data?.loyaltyPointsBalance ?? 0;
  const productPrice = Number(productRecord.productPrice) || 0;

  const characteristics = Array.isArray(productRecord.productCharacteristics)
    ? (productRecord.productCharacteristics as Array<{ name?: string; value?: string }>)
    : [];

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
    setPromotionModalVisible(true);
  };

  const handleClosePromotionModal = () => {
    setPromotionModalVisible(false);
    setPromotionErrorMessage("");
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

  const renderDetailsTab = () => (
    <>
      <View style={styles.priceRow}>
        <ProductPriceDisplay product={productRecord} showLabel={false} variant="inline" />
        <ProductDiscountBadge product={productRecord} />
      </View>
      <ProductCatalogStatusBadges product={productRecord} isPremiumUser={isPremiumUser} />
      {showRating ? (
        <Text style={styles.rating}>
          {PRODUCT_CARD_UI.RATING_LINE(averageRating, reviewCount)}
        </Text>
      ) : null}
      <Text style={[styles.availability, !isAvailable && styles.unavailable]}>
        {isAvailable ? "В наличии" : PRODUCT_UI.UNAVAILABLE}
      </Text>

      {topStatFieldKeys.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{PRODUCT_UI.STATS_SECTION}</Text>
          <ProductDetailFieldRows product={productRecord} fieldKeys={topStatFieldKeys} />
        </View>
      ) : null}

      <ProductSellerPreview
        seller={productRecord.productSeller}
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{PRODUCT_UI.DESCRIPTION_TITLE}</Text>
        <Text style={styles.sectionBody}>
          {description || PRODUCT_UI.NO_DESCRIPTION}
        </Text>
      </View>

      {characteristics.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE}</Text>
          {characteristics.map((item, index) => (
            <Text key={`${item.name}-${index}`} style={styles.sectionBody}>
              {item.name}: {item.value}
            </Text>
          ))}
        </View>
      ) : null}

      {isOwnProduct ? (
        <View style={styles.sellerActions}>
          <Pressable
            style={[
              styles.promoteButton,
              !canPromoteProduct && styles.promoteButtonDisabled,
            ]}
            onPress={handleOpenPromotionModal}
            disabled={!canPromoteProduct}
          >
            <Text
              style={[
                styles.promoteButtonText,
                !canPromoteProduct && styles.promoteButtonTextDisabled,
              ]}
            >
              {PRODUCT_CARD_UI.PROMOTION_BUTTON}
            </Text>
          </Pressable>
          <Pressable
            style={styles.editButton}
            onPress={() => router.push(`/edit-product/${productId}`)}
          >
            <Text style={styles.editButtonText}>{PRODUCT_CARD_UI.EDIT_PRODUCT}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Pressable
            style={styles.reportButton}
            onPress={handleReportPress}
            disabled={isAuthorized && hasPendingReport}
          >
            <Text
              style={[
                styles.reportButtonText,
                isAuthorized && hasPendingReport && styles.reportButtonTextDisabled,
              ]}
            >
              {isAuthorized && hasPendingReport
                ? PRODUCT_REPORT_UI.ALREADY_REPORTED
                : PRODUCT_REPORT_UI.REPORT_BUTTON}
            </Text>
          </Pressable>
          {reportSuccessMessage ? (
            <Text style={styles.reportSuccess}>{reportSuccessMessage}</Text>
          ) : null}
        </>
      )}

      {isAvailable && !isOwnProduct ? (
        <AddToCartButton productId={productId} product={productRecord} />
      ) : null}
    </>
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <ProductMediaGallery previewVideoUrl={previewVideoUrl} imageUrls={imageUrls} />

        <View style={styles.titleRow}>
          <Text style={styles.name}>{name}</Text>
          {!isOwnProduct ? (
            <WishlistToggleButton
              productId={productId}
              product={productRecord}
              variant="inline"
            />
          ) : null}
        </View>

        {showTabs ? (
          <ProductDetailTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        ) : null}

        {activeTab === "details" ? renderDetailsTab() : null}
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
            productPrice={Number(productRecord.productPrice)}
            isAuthorized={isAuthorized}
            isUserDataConfirmed={sessionQuery.data?.user?.isUserDataConfirmed === true}
            isOwnProduct={isOwnProduct}
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
          />
        ) : null}
      </ScrollView>

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
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
  },
  name: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  rating: {
    marginTop: 8,
    fontSize: 14,
    color: "#444",
  },
  availability: {
    marginTop: 8,
    fontSize: 14,
    color: "#2e7d32",
  },
  unavailable: {
    color: "#c62828",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 15,
    color: "#222",
    lineHeight: 22,
  },
  reportButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c62828",
  },
  reportButtonTextDisabled: {
    color: "#999",
  },
  reportSuccess: {
    marginTop: 8,
    fontSize: 13,
    color: "#2e7d32",
    textAlign: "center",
  },
  sellerActions: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
  },
  promoteButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#111",
    paddingVertical: 12,
    alignItems: "center",
  },
  promoteButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  promoteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  promoteButtonTextDisabled: {
    color: "#9ca3af",
  },
  editButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
});
