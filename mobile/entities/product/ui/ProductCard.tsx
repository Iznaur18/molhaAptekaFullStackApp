import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { formatProductReviewRatingLine } from "@/entities/product-review/lib/formatProductReviewRatingLine";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
import { ProductCardMedia } from "@/entities/product/ui/ProductCardMedia";
import { ProductCardSellerRow } from "@/entities/product/ui/ProductCardSellerRow";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "@/entities/product/ui/ProductPriceDisplay";
import { ProductLoyaltyPointsBadge } from "@/entities/product/ui/ProductLoyaltyPointsBadge";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { PRODUCT_REVIEW_UI, PRODUCT_UI } from "@/shared/config";
import { useProductCardStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardProps = {
  product: Record<string, unknown> & {
    _id: string;
    productName?: string;
    productPrice?: number;
    productIsAvailable?: boolean;
    productImageUrls?: unknown;
    productImageUrl?: unknown;
    productSeller?: string | { _id?: string } | null;
    averageRating?: number;
    reviewCount?: number;
  };
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const styles = useProductCardStyles();
  const { isPremiumUser } = useUserAccess();
  const isAuthorized = useIsAuthorized();
  const flags = useProductCardChromeFlags(product);
  const cardMedia = useProductCardMediaState(product);
  const name = product.productName?.trim() || "Без названия";
  const reviewLine = formatProductReviewRatingLine(product.averageRating, product.reviewCount);
  const hasReviewRating = reviewLine.length > 0;

  const handlePress = () => {
    router.push({ pathname: "/product/[id]", params: { id: product._id } });
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [styles.pressable, pressed && styles.cardPressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={PRODUCT_UI.OPEN_ARIA(name)}
      >
        <View style={styles.imageWrap}>
          <ProductCardMedia media={cardMedia} />
          {flags.showDiscountBadge || flags.showLoyaltyPointsBadge ? (
            <View style={styles.imageBadges} pointerEvents="box-none">
              {flags.showDiscountBadge ? (
                <ProductDiscountBadge product={product} variant="overlay" />
              ) : null}
              {flags.showLoyaltyPointsBadge ? (
                <ProductLoyaltyPointsBadge
                  product={product}
                  isAuthorized={isAuthorized}
                  isPremiumUser={isPremiumUser}
                  variant="overlay"
                />
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>

          <ProductPriceDisplay product={product} showLabel={false} variant="card" />

          <View style={styles.metaStrip}>
            <Text
              style={[styles.rating, !hasReviewRating && styles.ratingPlaceholder]}
              numberOfLines={1}
              accessibilityLabel={hasReviewRating ? reviewLine : PRODUCT_REVIEW_UI.NO_REVIEWS}
            >
              {hasReviewRating ? reviewLine : PRODUCT_REVIEW_UI.NO_REVIEWS}
            </Text>

            <ProductCatalogStatusBadges
              product={product}
              showHiddenBadge={product.productIsAvailable === false}
            />
          </View>

          <ProductCardSellerRow product={product} />
        </View>
      </Pressable>

      <View style={styles.wishlistSlot}>
        <WishlistToggleButton productId={product._id} product={product} variant="card" />
      </View>
    </View>
  );
};
