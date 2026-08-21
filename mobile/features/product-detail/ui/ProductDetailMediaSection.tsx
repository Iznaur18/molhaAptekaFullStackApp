import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { ProductMediaGallery } from "@/entities/product/ui/ProductMediaGallery";
import { ProductShareLinkButton } from "@/entities/product/ui/ProductShareLinkButton";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { PRODUCT_REPORT_UI } from "@/shared/config";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";
import { semanticColors } from "@/shared/theme/semanticColors";

type ProductDetailMediaSectionProps = {
  product: Record<string, unknown>;
  productId: string;
  imageUrls: string[];
  previewVideoUrl: string | null;
  isOwnProduct: boolean;
  onReportPress: () => void;
  reportDisabled: boolean;
};

export const ProductDetailMediaSection = ({
  product,
  productId,
  imageUrls,
  previewVideoUrl,
  isOwnProduct,
  onReportPress,
  reportDisabled,
}: ProductDetailMediaSectionProps) => {
  const router = useRouter();
  const styles = useProductDetailScreenStyles();

  return (
    <ProductMediaGallery
      variant="detail"
      previewVideoUrl={previewVideoUrl}
      imageUrls={imageUrls}
      onBack={() => router.back()}
      heroOverlay={
        <View style={styles.heroActions}>
          {!isOwnProduct ? (
            <Pressable
              style={[styles.detailReportButton, reportDisabled && styles.detailReportButtonDisabled]}
              onPress={onReportPress}
              disabled={reportDisabled}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={
                reportDisabled ? PRODUCT_REPORT_UI.ALREADY_REPORTED : PRODUCT_REPORT_UI.REPORT_BUTTON
              }
            >
              <MaterialIcons name="flag" size={20} color={semanticColors.danger} />
            </Pressable>
          ) : null}
          <ProductShareLinkButton product={product} />
          {!isOwnProduct ? (
            <WishlistToggleButton
              productId={productId}
              product={product}
              variant="detailHeroInline"
            />
          ) : null}
        </View>
      }
    />
  );
};
