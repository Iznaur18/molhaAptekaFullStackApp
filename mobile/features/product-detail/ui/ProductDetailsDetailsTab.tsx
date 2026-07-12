import { semanticColors } from "@/shared/theme/semanticColors";
import { hasProductCharacteristicsContent } from "@izibuy/shared-lib";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import {
  getProductFieldReadLayout,
  getProductFieldLabel,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
} from "@/entities/product/lib/productFieldRegistry";
import { filterProductDetailsVisibleFieldKeys } from "@/entities/product/lib/isProductDetailsFieldVisible";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
import { ProductCharacteristicsDetails } from "@/entities/product/ui/ProductCharacteristicsDetails";
import { ProductDetailFieldRows } from "@/entities/product/ui/ProductDetailFieldRows";
import { ProductDetailsSellerPreview } from "@/entities/product/ui/ProductDetailsSellerPreview";
import { ProductLoyaltyPointsBadge } from "@/entities/product/ui/ProductLoyaltyPointsBadge";
import { ProductMediaGallery } from "@/entities/product/ui/ProductMediaGallery";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "@/entities/product/ui/ProductPriceDisplay";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import {
  PRODUCT_DETAILS_MODAL_UI,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsDetailsTabProps = {
  product: Record<string, unknown>;
  productId: string;
  imageUrls: string[];
  previewVideoUrl: string | null;
  isOwnProduct: boolean;
  topStatFieldKeys: readonly string[];
  onReportPress: () => void;
  reportDisabled: boolean;
};

export const ProductDetailsDetailsTab = ({
  product,
  productId,
  imageUrls,
  previewVideoUrl,
  isOwnProduct,
  topStatFieldKeys,
  onReportPress,
  reportDisabled,
}: ProductDetailsDetailsTabProps) => {
  const router = useRouter();
  const styles = useProductDetailScreenStyles();
  const isAuthorized = useIsAuthorized();
  const { isPremiumUser } = useUserAccess();
  const name = String(product.productName ?? "").trim() || "Товар";
  const [contentTab, setContentTab] = useState<"description" | "characteristics">("description");

  const bottomMetaFieldKeys = PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS.filter(
    (key) => getProductFieldReadLayout(key) === "meta",
  );
  const characteristics = product.productCharacteristics;
  const descriptionText = String(product.productDescription ?? "").trim();
  const hasDescription = descriptionText.length > 0;
  const hasCharacteristics = hasProductCharacteristicsContent({
    productCharacteristics: Array.isArray(characteristics) ? characteristics : [],
  });
  const hasContent = hasDescription || hasCharacteristics;
  const showContentTabs = hasDescription || hasCharacteristics;
  const resolvedContentTab =
    hasDescription && hasCharacteristics
      ? contentTab
      : hasDescription
        ? "description"
        : "characteristics";

  const charItems = Array.isArray(characteristics)
    ? (characteristics as Array<{ key?: string; name?: string; value?: string }>)
    : [];

  const showDescription = hasDescription && resolvedContentTab === "description";
  const showCharacteristics = hasCharacteristics && resolvedContentTab === "characteristics";

  return (
    <View style={styles.rowTop}>
      <ProductMediaGallery
        variant="detail"
        previewVideoUrl={previewVideoUrl}
        imageUrls={imageUrls}
        onBack={() => router.back()}
        heroOverlay={
          !isOwnProduct ? (
            <View style={styles.heroActions}>
              <Pressable
                style={[styles.detailReportButton, reportDisabled && styles.detailReportButtonDisabled]}
                onPress={onReportPress}
                disabled={reportDisabled}
                accessibilityRole="button"
                accessibilityLabel={
                  reportDisabled ? PRODUCT_REPORT_UI.ALREADY_REPORTED : PRODUCT_REPORT_UI.REPORT_BUTTON
                }
              >
                <MaterialIcons name="flag" size={20} color={semanticColors.danger} />
              </Pressable>
              <WishlistToggleButton
                productId={productId}
                product={product}
                variant="detailHeroInline"
              />
            </View>
          ) : null
        }
      />

      <View style={styles.spec}>
        <View style={styles.priceBlock}>
          <Text style={styles.productName}>{name}</Text>
          <ProductPriceDisplay product={product} showLabel={false} variant="detail" />
          <View style={styles.priceBadgeRow}>
            <ProductDiscountBadge product={product} variant="detail" />
            <ProductLoyaltyPointsBadge
              product={product}
              isAuthorized={isAuthorized}
              variant="detail"
            />
            <ProductCatalogStatusBadges product={product} showNoStatusPlaceholder={false} />
          </View>
        </View>

        {topStatFieldKeys.length > 0 ? (
          <ProductDetailFieldRows product={product} fieldKeys={topStatFieldKeys} />
        ) : null}
      </View>

      <ProductDetailsSellerPreview seller={product.productSeller} />

      {hasContent ? (
        <View
          style={styles.detailsSection}
          accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.DETAILS_SECTION_ARIA}
        >
          {showContentTabs ? (
            <View style={styles.contentSwitcherTabs}>
              {hasDescription ? (
                <Pressable
                  style={[
                    styles.contentSwitcherTab,
                    resolvedContentTab === "description" && styles.contentSwitcherTabActive,
                  ]}
                  onPress={() => setContentTab("description")}
                >
                  <Text
                    style={[
                      styles.contentSwitcherTabText,
                      resolvedContentTab === "description" && styles.contentSwitcherTabTextActive,
                    ]}
                  >
                    {getProductFieldLabel("productDescription")}
                  </Text>
                </Pressable>
              ) : null}
              {hasCharacteristics ? (
                <Pressable
                  style={[
                    styles.contentSwitcherTab,
                    resolvedContentTab === "characteristics" && styles.contentSwitcherTabActive,
                  ]}
                  onPress={() => setContentTab("characteristics")}
                >
                  <Text
                    style={[
                      styles.contentSwitcherTabText,
                      resolvedContentTab === "characteristics" && styles.contentSwitcherTabTextActive,
                    ]}
                  >
                    {PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {showDescription || showCharacteristics ? (
            <View
              style={styles.contentSwitcherPanel}
              role={
                showContentTabs && Platform.OS === "web" ? "tabpanel" : undefined
              }
              accessibilityLabel={
                showCharacteristics
                  ? PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_SECTION_ARIA
                  : PRODUCT_DETAILS_MODAL_UI.DESCRIPTION_SECTION_ARIA
              }
            >
              {showDescription ? (
                <Text style={styles.descriptionText}>{descriptionText}</Text>
              ) : null}

              {showCharacteristics ? (
                <ProductCharacteristicsDetails
                  items={charItems}
                  showTitle={!showContentTabs}
                  embedded
                />
              ) : null}
            </View>
          ) : null}

          {bottomMetaFieldKeys.length > 0 ? (
            <View style={styles.metaGrid}>
              <ProductDetailFieldRows product={product} fieldKeys={bottomMetaFieldKeys} />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
