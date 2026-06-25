import { hasProductCharacteristicsContent } from "@izibuy/shared-lib";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  getProductFieldReadLayout,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
} from "@/entities/product/lib/productFieldRegistry";
import { filterProductDetailsVisibleFieldKeys } from "@/entities/product/lib/isProductDetailsFieldVisible";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
import { ProductCharacteristicsDetails } from "@/entities/product/ui/ProductCharacteristicsDetails";
import { ProductDetailFieldRows } from "@/entities/product/ui/ProductDetailFieldRows";
import { ProductDetailsSellerPreview } from "@/entities/product/ui/ProductDetailsSellerPreview";
import { ProductMediaGallery } from "@/entities/product/ui/ProductMediaGallery";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "@/entities/product/ui/ProductPriceDisplay";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { PRODUCT_DETAILS_MODAL_UI, PRODUCT_REPORT_UI } from "@/shared/config";
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
  const name = String(product.productName ?? "").trim() || "Товар";

  const bottomBlockFieldKeys = filterProductDetailsVisibleFieldKeys(
    PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS.filter(
      (key) => getProductFieldReadLayout(key) === "block",
    ),
    product,
  );
  const bottomMetaFieldKeys = PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS.filter(
    (key) => getProductFieldReadLayout(key) === "meta",
  );
  const characteristics = product.productCharacteristics;
  const hasDetailsSection =
    bottomBlockFieldKeys.length > 0 ||
    bottomMetaFieldKeys.length > 0 ||
    hasProductCharacteristicsContent({
      productDescription:
        typeof product.productDescription === "string" ? product.productDescription : "",
      productCharacteristics: Array.isArray(characteristics) ? characteristics : [],
    });

  const reportOverlay =
    !isOwnProduct ? (
      <Pressable
        style={[styles.detailReportButton, reportDisabled && styles.detailReportButtonDisabled]}
        onPress={onReportPress}
        disabled={reportDisabled}
        accessibilityRole="button"
        accessibilityLabel={
          reportDisabled ? PRODUCT_REPORT_UI.ALREADY_REPORTED : PRODUCT_REPORT_UI.REPORT_BUTTON
        }
      >
        <MaterialIcons name="flag" size={20} color="#dc2626" />
      </Pressable>
    ) : null;

  return (
    <View style={styles.rowTop}>
      <ProductMediaGallery
        variant="detail"
        previewVideoUrl={previewVideoUrl}
        imageUrls={imageUrls}
        onBack={() => router.back()}
        heroOverlay={
          !isOwnProduct ? (
            <WishlistToggleButton
              productId={productId}
              product={product}
              variant="detailHero"
            />
          ) : null
        }
        reportOverlay={reportOverlay}
      />

      <View style={styles.spec}>
        <View style={styles.priceBlock}>
          <Text style={styles.productName}>{name}</Text>
          <ProductPriceDisplay product={product} showLabel={false} variant="detail" />
          <View style={styles.priceBadgeRow}>
            <ProductDiscountBadge product={product} variant="detail" />
            <ProductCatalogStatusBadges product={product} showNoStatusPlaceholder={false} />
          </View>
        </View>

        {topStatFieldKeys.length > 0 ? (
          <ProductDetailFieldRows product={product} fieldKeys={topStatFieldKeys} />
        ) : null}
      </View>

      <ProductDetailsSellerPreview seller={product.productSeller} />

      {hasDetailsSection ? (
        <View
          style={styles.detailsSection}
          accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.DETAILS_SECTION_ARIA}
        >
          {bottomBlockFieldKeys.length > 0 ? (
            <ProductDetailFieldRows
              product={product}
              fieldKeys={bottomBlockFieldKeys}
              layout="stack"
            />
          ) : null}
          <ProductCharacteristicsDetails
            items={
              Array.isArray(characteristics)
                ? (characteristics as Array<{ key?: string; name?: string; value?: string }>)
                : []
            }
          />
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
