import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { formatProductReviewRatingLine } from "@/entities/product-review/lib/formatProductReviewRatingLine";
import {
  hasProductCatalogDiscount,
  resolveProductDiscountPercent,
} from "@/entities/product/lib/computeProductDiscountPercent";
import { buildMyProductCompactCardFeatureBadges } from "@/entities/product/lib/buildMyProductCompactCardFeatureBadges";
import {
  canSellerEditProduct,
  getProductModerationBadgeLabel,
  getProductModerationBadgeVariant,
  getProductModerationRejectionComment,
  isProductModerationPending,
} from "@/entities/product/lib/getProductModerationUi";
import { resolveProductPromotionCompactBadge } from "@/entities/product/lib/resolveProductPromotionCompactBadge";
import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { shouldShowProductLoyaltyPointsBadge } from "@/entities/product/lib/shouldShowProductLoyaltyPointsBadge";
import { ProductCompactCardMediaThumb } from "@/entities/product/ui/ProductCompactCardMediaThumb";
import { ProductCompactCardStatusPill } from "@/entities/product/ui/ProductCompactCardStatusPill";
import { ProductCardSellerToolbar } from "@/entities/product/ui/ProductCardSellerToolbar";
import { ProductPriceDisplay } from "@/entities/product/ui/ProductPriceDisplay";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { PRODUCT_CARD_UI, PRODUCT_MODERATION_PAGE_UI, PRODUCT_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useProductCompactCardStyles } from "@/shared/theme/productCompactCardStyles";

type MyProductCatalogCardProps = {
  product: Record<string, unknown> & {
    _id: string;
    productName?: string;
    averageRating?: number;
    reviewCount?: number;
  };
  isLoyaltyPointsOvercommitted?: boolean;
  onEditProduct?: () => void;
  onPromoteProduct?: () => void;
};

export const MyProductCatalogCard = ({
  product,
  isLoyaltyPointsOvercommitted = false,
  onEditProduct,
  onPromoteProduct,
}: MyProductCatalogCardProps) => {
  const router = useRouter();
  const styles = useProductCompactCardStyles();
  const isAuthorized = useIsAuthorized();
  const { isUserDataConfirmed } = useUserAccess();

  const name = product.productName?.trim() || "Без названия";
  const openProductLabel = PRODUCT_UI.OPEN_ARIA(name);
  const reviewLine = formatProductReviewRatingLine(product.averageRating, product.reviewCount);
  const hasDiscount = hasProductCatalogDiscount(product);
  const discountPercent = resolveProductDiscountPercent(product);
  const moderationVariant = getProductModerationBadgeVariant(product);
  const moderationLabel = getProductModerationBadgeLabel(product);
  const rejectionComment = getProductModerationRejectionComment(product, true);
  const isPending = isProductModerationPending(product);
  const promotionBadge = resolveProductPromotionCompactBadge(product);
  const featureBadges = buildMyProductCompactCardFeatureBadges({
    product,
    isLoyaltyPointsOvercommitted,
  });
  const showLoyaltyPoints = shouldShowProductLoyaltyPointsBadge(product);
  const loyaltyPoints = resolveProductLoyaltyPointsPerUnit(product);
  const loyaltyLabel = !isAuthorized
    ? PRODUCT_CARD_UI.LOYALTY_POINTS_GUEST(loyaltyPoints)
    : isUserDataConfirmed
      ? PRODUCT_CARD_UI.LOYALTY_POINTS_CONFIRMED(loyaltyPoints)
      : PRODUCT_CARD_UI.LOYALTY_POINTS_UNCONFIRMED(loyaltyPoints);

  const openProduct = () => {
    router.push({ pathname: "/product/[id]", params: { id: product._id } });
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <ProductCompactCardMediaThumb
          product={product}
          onPress={openProduct}
          accessibilityLabel={openProductLabel}
          dimmed={isPending}
        />

        <View style={styles.summary}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusRowScroll}
            contentContainerStyle={styles.statusRow}
            {...nestedHorizontalScrollProps}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.statusPill,
                moderationVariant === "pending" && styles.statusPillPending,
                moderationVariant === "approved" && styles.statusPillApproved,
                moderationVariant === "rejected" && styles.statusPillRejected,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  moderationVariant === "approved" && styles.statusPillTextApproved,
                  moderationVariant === "rejected" && styles.statusPillTextRejected,
                ]}
              >
                {moderationLabel}
              </Text>
            </View>
            {hasDiscount && discountPercent != null ? (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>-{discountPercent}%</Text>
              </View>
            ) : null}
            {promotionBadge ? (
              <View
                style={[
                  styles.promotionPill,
                  promotionBadge.tier === "top"
                    ? styles.promotionPillTop
                    : promotionBadge.tier === "banner"
                      ? styles.promotionPillBanner
                      : styles.promotionPillBoost,
                ]}
              >
                <Text
                  style={[
                    styles.promotionPillText,
                    promotionBadge.tier === "top"
                      ? styles.promotionPillTextTop
                      : promotionBadge.tier === "banner"
                        ? styles.promotionPillTextBanner
                        : styles.promotionPillTextBoost,
                  ]}
                >
                  {promotionBadge.label}
                </Text>
              </View>
            ) : null}
            {featureBadges.map((badge) => (
              <ProductCompactCardStatusPill
                key={badge.key}
                label={badge.label}
                variant={badge.variant}
              />
            ))}
          </ScrollView>

          <Pressable
            onPress={openProduct}
            accessibilityRole="button"
            accessibilityLabel={openProductLabel}
          >
            <Text style={styles.title} numberOfLines={2}>
              {name}
            </Text>
          </Pressable>

          <View style={styles.priceRow}>
            <ProductPriceDisplay product={product} showLabel={false} variant="inline" />
            {showLoyaltyPoints ? (
              <View style={styles.loyaltyPill}>
                <Text style={styles.loyaltyPillText} numberOfLines={1}>
                  {loyaltyLabel}
                </Text>
              </View>
            ) : null}
          </View>

          {reviewLine ? (
            <Text style={styles.metaMuted} numberOfLines={1}>
              {reviewLine}
            </Text>
          ) : null}
        </View>
      </View>

      {rejectionComment ? (
        <Text style={styles.rejectionComment} numberOfLines={3}>
          {PRODUCT_MODERATION_PAGE_UI.REJECTION_COMMENT_PREFIX} {rejectionComment}
        </Text>
      ) : null}

      <View style={styles.divider} />

      <ProductCardSellerToolbar
        onPromote={onPromoteProduct}
        onEdit={onEditProduct}
        canEdit={canSellerEditProduct(product)}
        variant="compact"
      />
    </View>
  );
};
