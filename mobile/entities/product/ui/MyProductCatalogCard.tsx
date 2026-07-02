import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { formatProductReviewRatingLine } from "@/entities/product-review/lib/formatProductReviewRatingLine";
import {
  hasProductCatalogDiscount,
  resolveProductDiscountPercent,
} from "@/entities/product/lib/computeProductDiscountPercent";
import {
  canSellerEditProduct,
  getProductModerationBadgeLabel,
  getProductModerationBadgeVariant,
  getProductModerationRejectionComment,
  isProductModerationPending,
} from "@/entities/product/lib/getProductModerationUi";
import { getProductCardMineStatusBadge } from "@/entities/product/lib/getProductCardMineStatusBadge";
import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { shouldShowProductLoyaltyPointsBadge } from "@/entities/product/lib/shouldShowProductLoyaltyPointsBadge";
import { ProductCompactCardMediaThumb } from "@/entities/product/ui/ProductCompactCardMediaThumb";
import { ProductCardSellerRow } from "@/entities/product/ui/ProductCardSellerRow";
import { ProductCardSellerToolbar } from "@/entities/product/ui/ProductCardSellerToolbar";
import { ProductPriceDisplay } from "@/entities/product/ui/ProductPriceDisplay";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { PRODUCT_CARD_UI, PRODUCT_MODERATION_PAGE_UI, PRODUCT_UI } from "@/shared/config";
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
  const { isPremiumUser } = useUserAccess();

  const name = product.productName?.trim() || "Без названия";
  const openProductLabel = PRODUCT_UI.OPEN_ARIA(name);
  const reviewLine = formatProductReviewRatingLine(product.averageRating, product.reviewCount);
  const hasDiscount = hasProductCatalogDiscount(product);
  const discountPercent = resolveProductDiscountPercent(product);
  const moderationVariant = getProductModerationBadgeVariant(product);
  const moderationLabel = getProductModerationBadgeLabel(product);
  const rejectionComment = getProductModerationRejectionComment(product, true);
  const isPending = isProductModerationPending(product);
  const mineStatusBadge = getProductCardMineStatusBadge({
    product,
    isLoyaltyPointsOvercommitted,
  });
  const showLoyaltyPoints = shouldShowProductLoyaltyPointsBadge(product);
  const loyaltyPoints = resolveProductLoyaltyPointsPerUnit(product);
  const loyaltyLabel = !isAuthorized
    ? PRODUCT_CARD_UI.LOYALTY_POINTS_GUEST(loyaltyPoints)
    : isPremiumUser
      ? PRODUCT_CARD_UI.LOYALTY_POINTS_PREMIUM(loyaltyPoints)
      : PRODUCT_CARD_UI.LOYALTY_POINTS_WITH_PREMIUM(loyaltyPoints);

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
          <View style={styles.statusRow}>
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
          </View>

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
            {hasDiscount && discountPercent != null ? (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>-{discountPercent}%</Text>
              </View>
            ) : null}
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

          {mineStatusBadge ? (
            <Text style={styles.metaHint} numberOfLines={2}>
              {mineStatusBadge.label}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <ProductCardSellerRow product={product} />
          </View>
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
