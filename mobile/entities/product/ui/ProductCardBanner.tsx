import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { formatProductReviewRatingLine } from "@/entities/product-review/lib/formatProductReviewRatingLine";
import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { resolveProductCardPromotionFrameStyle } from "@/entities/product/lib/resolveProductCardPromotionFrameStyle";
import { PRODUCT_CARD_PROMOTION_TIER } from "@/entities/product/lib/productCardPromotionFramePalette";
import { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { ProductCardPromotionBackground } from "@/entities/product/ui/ProductCardPromotionBackground";
import { ProductCardMediaSlide } from "@/entities/product/ui/ProductCardMediaSlide";
import { ProductCardSellerRow } from "@/entities/product/ui/ProductCardSellerRow";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "@/entities/product/ui/ProductPriceDisplay";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { PRODUCT_CARD_UI, PRODUCT_UI } from "@/shared/config";
import { PRODUCT_CARD_BANNER_CHROME as BANNER_CHROME } from "@/entities/product/lib/productCardBadgePalette";
import { useProductCardBannerStyles } from "@/shared/theme/catalogProductStyles";

const BANNER_OUTER_RADIUS = BANNER_CHROME.outerRadius;

type ProductCardBannerProps = {
  product: Record<string, unknown> & {
    _id: string;
    productName?: string;
    productPrice?: number;
    productOldPrice?: number;
    discountPercent?: number;
    productSeller?: string | { _id?: string } | null;
    averageRating?: number;
    reviewCount?: number;
  };
};

export const ProductCardBanner = ({ product }: ProductCardBannerProps) => {
  const router = useRouter();
  const styles = useProductCardBannerStyles();
  const flags = useProductCardChromeFlags(product, { promotionFullWidth: true });
  const cardMedia = useProductCardMediaState(product);
  const name = product.productName?.trim() || "Без названия";
  const reviewLine = formatProductReviewRatingLine(product.averageRating, product.reviewCount);
  const hasReviewRating = reviewLine.length > 0;
  const openProductLabel = PRODUCT_UI.OPEN_ARIA(name);

  const handlePress = () => {
    router.push({ pathname: "/product/[id]", params: { id: product._id } });
  };

  const bannerInnerFrameStyle = resolveProductCardPromotionFrameStyle(
    PRODUCT_CARD_PROMOTION_TIER.BANNER,
    "banner-inner",
  );

  return (
    <View style={styles.frame}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          bannerInnerFrameStyle,
          pressed && styles.cardPressed,
        ]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={openProductLabel}
      >
        <ProductCardPromotionBackground
          tier={PRODUCT_CARD_PROMOTION_TIER.BANNER}
          variant="banner-inner"
          borderRadius={BANNER_OUTER_RADIUS - 1}
        />

        <View style={styles.imageWrap}>
          <View style={styles.imagePressable}>
            <ProductCardMediaSlide media={cardMedia} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>{PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE}</Text>
          </View>

          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          <View style={styles.priceRow}>
            <ProductPriceDisplay product={product} showLabel={false} variant="banner" />
            {flags.showDiscountBadge ? (
              <ProductDiscountBadge product={product} variant="banner" />
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <ProductCardSellerRow product={product} />
            {hasReviewRating ? (
              <>
                <Text style={styles.metaSeparator} accessibilityElementsHidden>
                  |
                </Text>
                <Text
                  style={[styles.metaText, styles.metaRating]}
                  numberOfLines={1}
                  accessibilityLabel={reviewLine}
                >
                  {reviewLine}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </Pressable>

      <View style={styles.wishlistSlot}>
        <WishlistToggleButton productId={product._id} product={product} variant="card" />
      </View>
    </View>
  );
};
