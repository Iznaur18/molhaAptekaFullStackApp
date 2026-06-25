import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { formatProductReviewRatingLine } from "@/entities/product-review/lib/formatProductReviewRatingLine";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { resolveProductCardPromotionFrameStyle } from "@/entities/product/lib/resolveProductCardPromotionFrameStyle";
import { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { ProductCardPromotionBackground } from "@/entities/product/ui/ProductCardPromotionBackground";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
import { ProductCardMediaGalleryNav } from "@/entities/product/ui/ProductCardMediaGalleryNav";
import { ProductCardMediaSlide } from "@/entities/product/ui/ProductCardMediaSlide";
import { ProductCardBanner } from "@/entities/product/ui/ProductCardBanner";
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
  promotionFullWidth?: boolean;
  layout?: "default" | "catalog-grid";
  highlightCatalogPromotion?: boolean;
  isMineMode?: boolean;
  isModerationQueue?: boolean;
};

export const ProductCard = ({
  product,
  promotionFullWidth = false,
  layout = "default",
  highlightCatalogPromotion = true,
  isMineMode = false,
  isModerationQueue = false,
}: ProductCardProps) => {
  const router = useRouter();
  const styles = useProductCardStyles();
  const { isPremiumUser } = useUserAccess();
  const isAuthorized = useIsAuthorized();
  const flags = useProductCardChromeFlags(product, {
    promotionFullWidth,
    highlightCatalogPromotion,
    isMineMode,
    isModerationQueue,
  });
  const cardMedia = useProductCardMediaState(product);
  const name = product.productName?.trim() || "Без названия";
  const reviewLine = formatProductReviewRatingLine(product.averageRating, product.reviewCount);
  const hasReviewRating = reviewLine.length > 0;
  const openProductLabel = PRODUCT_UI.OPEN_ARIA(name);

  if (flags.showBannerLayout) {
    return <ProductCardBanner product={product} />;
  }

  const handlePress = () => {
    router.push({ pathname: "/product/[id]", params: { id: product._id } });
  };

  const isCatalogGrid = layout === "catalog-grid";
  const showPromotionFrame = flags.showPromotionChrome && flags.promotionFrameTier != null;
  const showCardChrome = showPromotionFrame || flags.showPremiumChrome;

  const promotionFrameStyle = showCardChrome
    ? resolveProductCardPromotionFrameStyle(flags.promotionFrameTier, "compact", {
        isPremium: flags.showPremiumChrome,
      })
    : null;

  return (
    <View
      style={[
        styles.card,
        isCatalogGrid && styles.cardCatalogGrid,
        promotionFrameStyle,
      ]}
    >
      {showPromotionFrame && flags.promotionFrameTier ? (
        <ProductCardPromotionBackground
          tier={flags.promotionFrameTier}
          variant="compact"
          isPremium={flags.showPremiumChrome}
        />
      ) : null}

      <View style={[styles.imageWrap, isCatalogGrid && styles.imageWrapCatalogGrid]}>
        <Pressable
          style={({ pressed }) => [styles.imagePressable, pressed && styles.cardPressed]}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={openProductLabel}
        >
          <ProductCardMediaSlide media={cardMedia} />
        </Pressable>

        <ProductCardMediaGalleryNav media={cardMedia} />

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

      <Pressable
        style={({ pressed }) => [styles.contentPressable, pressed && styles.cardPressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={openProductLabel}
      >
        <View style={[styles.content, isCatalogGrid && styles.contentCatalogGrid]}>
          <Text
            style={[styles.name, isCatalogGrid && styles.nameCatalogGrid]}
            numberOfLines={1}
          >
            {name}
          </Text>

          <ProductPriceDisplay product={product} showLabel={false} variant="card" />

          <View style={[styles.metaStrip, isCatalogGrid && styles.metaStripCatalogGrid]}>
            <Text
              style={[
                styles.rating,
                isCatalogGrid && styles.ratingCatalogGrid,
                !hasReviewRating && styles.ratingPlaceholder,
              ]}
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

          <View style={isCatalogGrid ? styles.sellerRowCatalogGrid : undefined}>
            <ProductCardSellerRow product={product} />
          </View>
        </View>
      </Pressable>

      <View style={styles.wishlistSlot}>
        <WishlistToggleButton productId={product._id} product={product} variant="card" />
      </View>
    </View>
  );
};
