import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { getProductSellerDisplayName } from "@/entities/product/lib/getProductSellerDisplayName";
import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { resolveProductPreviewVideoUrl } from "@/entities/product/lib/resolveProductPreviewVideoUrl";
import { ProductMediaGallery } from "@/entities/product/ui/ProductMediaGallery";
import { useCatalogProductQuery } from "@/entities/product/model/useCatalogProductQuery";
import { useMyProductReportStatusQuery } from "@/entities/product-report/model/useMyProductReportStatusQuery";
import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { ReportProductModal } from "@/features/product-report/ui/ReportProductModal";
import { API_CLIENT_UI, PRODUCT_REPORT_UI, PRODUCT_UI } from "@/shared/config";
import { formatApiErrorMessage, formatPriceRub } from "@/shared/lib";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id ?? "";
  const productQuery = useCatalogProductQuery(productId);
  const isAuthorized = useIsAuthorized();
  const reportStatusQuery = useMyProductReportStatusQuery({
    productId,
    enabled: isAuthorized,
  });
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState("");

  if (productQuery.isPending) {
    return <ScreenLoadingState />;
  }

  if (productQuery.isError || !productQuery.data) {
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

  const product = productQuery.data;
  const imageUrls = resolveProductImageUrls(product);
  const previewVideoUrl = resolveProductPreviewVideoUrl(product);
  const name = product.productName?.trim() || "Без названия";
  const isAvailable = product.productIsAvailable !== false;
  const rawDescription = (product as Record<string, unknown>).productDescription;
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";
  const sellerName = getProductSellerDisplayName(product);
  const hasPendingReport = reportStatusQuery.data?.hasPendingReport ?? false;

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

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <ProductMediaGallery previewVideoUrl={previewVideoUrl} imageUrls={imageUrls} />

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{formatPriceRub(product.productPrice)}</Text>
        <Text style={[styles.availability, !isAvailable && styles.unavailable]}>
          {isAvailable ? "В наличии" : PRODUCT_UI.UNAVAILABLE}
        </Text>

        {sellerName ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{PRODUCT_UI.SELLER_TITLE}</Text>
            <Text style={styles.sectionBody}>{sellerName}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{PRODUCT_UI.DESCRIPTION_TITLE}</Text>
          <Text style={styles.sectionBody}>
            {description || PRODUCT_UI.NO_DESCRIPTION}
          </Text>
        </View>

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

        {isAvailable ? <AddToCartButton productId={productId} product={product} /> : null}
      </ScrollView>

      <ReportProductModal
        visible={reportModalVisible}
        productId={productId}
        productName={name}
        hasPendingReport={hasPendingReport}
        onClose={() => setReportModalVisible(false)}
        onSubmitted={handleReportSubmitted}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  name: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  price: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
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
  error: {
    color: "#c62828",
    textAlign: "center",
  },
});
