import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { formatProductReviewRatingLine } from "@/entities/product-review/lib/formatProductReviewRatingLine";
import {
  canSellerEditProduct,
  getProductModerationBadgeLabel,
  getProductModerationBadgeVariant,
  getProductModerationRejectionComment,
  shouldShowProductModerationPendingOverlay,
} from "@/entities/product/lib/getProductModerationUi";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { resolveProductCardPromotionFrameStyle } from "@/entities/product/lib/resolveProductCardPromotionFrameStyle";
import { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { ProductCardPromotionBackground } from "@/entities/product/ui/ProductCardPromotionBackground";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
import { ProductCardMediaGalleryCounter } from "@/entities/product/ui/ProductCardMediaGalleryNav";
import { ProductMediaHorizontalPager } from "@/entities/product/ui/ProductMediaHorizontalPager";
import { ProductMediaSlideContent } from "@/entities/product/ui/ProductMediaSlideContent";
import { useProductCardMediaStyles } from "@/shared/theme/catalogProductStyles";
import { ProductCardBanner } from "@/entities/product/ui/ProductCardBanner";
import { ProductCardModerationPendingOverlay } from "@/entities/product/ui/ProductCardModerationPendingOverlay";
import { ProductCardModerationPreviewFields } from "@/entities/product/ui/ProductCardModerationPreviewFields";
import {
  ProductModerationDetailsFooter,
  type ProductModerationActions,
} from "@/entities/product/ui/ProductModerationDetailsFooter";
import { ProductCardSellerRow } from "@/entities/product/ui/ProductCardSellerRow";
import { ProductCardSellerToolbar } from "@/entities/product/ui/ProductCardSellerToolbar";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "@/entities/product/ui/ProductPriceDisplay";
import { ProductLoyaltyPointsBadge } from "@/entities/product/ui/ProductLoyaltyPointsBadge";
import { WishlistToggleButton } from "@/features/wishlist-toggle/ui/WishlistToggleButton";
import { PRODUCT_MODERATION_PAGE_UI, PRODUCT_CARD_UI, PRODUCT_REVIEW_UI, PRODUCT_UI } from "@/shared/config";
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
  moderationActions?: ProductModerationActions | null;
  onEditProduct?: () => void;
  onPromoteProduct?: () => void;
  onDeleteProduct?: () => void;
  isDeletePending?: boolean;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
  isLoyaltyPointsOvercommitted?: boolean;
};

export const ProductCard = ({
  product,
  promotionFullWidth = false,
  layout = "default",
  highlightCatalogPromotion = true,
  isMineMode = false,
  isModerationQueue = false,
  moderationActions = null,
  onEditProduct,
  onPromoteProduct,
  onDeleteProduct,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  isLoyaltyPointsOvercommitted = false,
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

  const cardMediaStyles = useProductCardMediaStyles();
  const gallerySlideCount = Math.max(cardMedia.mediaSlides.length, 1);

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

  const moderationBadgeVariant = getProductModerationBadgeVariant(product);
  const moderationBadgeLabel = getProductModerationBadgeLabel(product);
  const moderationRejectionComment = getProductModerationRejectionComment(product, isMineMode);
  const showModerationPendingOverlay = shouldShowProductModerationPendingOverlay(product, {
    isMineMode,
    isModerationQueue,
  });
  const showModerationBadge =
    (isMineMode || isModerationQueue) &&
    !showModerationPendingOverlay &&
    !(isCatalogGrid && isModerationQueue);
  const showSellerFooter =
    !flags.showBannerLayout &&
    (typeof onEditProduct === "function" ||
      typeof onPromoteProduct === "function" ||
      typeof onDeleteProduct === "function");
  const showWishlistToggle = !isMineMode && !isModerationQueue;

  return (
    <View
      style={[
        styles.card,
        isCatalogGrid && styles.cardCatalogGrid,
        isCatalogGrid && isModerationQueue && styles.cardCatalogGridModerationQueue,
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
        <ProductMediaHorizontalPager
          style={styles.imagePressable}
          slideCount={gallerySlideCount}
          activeIndex={cardMedia.cardSlideIndex}
          onIndexChange={cardMedia.setCardSlideIndex}
          renderSlide={(index) => (
            <Pressable
              style={cardMediaStyles.frame}
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityLabel={openProductLabel}
            >
              <ProductMediaSlideContent
                slide={cardMedia.mediaSlides[index] ?? null}
                imageStyle={cardMediaStyles.media}
                onVideoFailed={() => cardMedia.setPreviewVideoFailed(true)}
              />
            </Pressable>
          )}
        />

        {showModerationPendingOverlay ? <ProductCardModerationPendingOverlay /> : null}

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

        <ProductCardMediaGalleryCounter
          slideIndex={cardMedia.cardSlideIndex}
          slideCount={cardMedia.mediaSlides.length}
        />
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

          {isModerationQueue ? (
            <>
              {showModerationBadge ? (
                <Text
                  style={[
                    styles.moderationBadge,
                    moderationBadgeVariant === "pending" && styles.moderationBadgePending,
                    moderationBadgeVariant === "approved" && styles.moderationBadgeApproved,
                    moderationBadgeVariant === "rejected" && styles.moderationBadgeRejected,
                  ]}
                  accessibilityRole="text"
                  accessibilityLabel={moderationBadgeLabel}
                >
                  {moderationBadgeLabel}
                </Text>
              ) : null}
              {moderationRejectionComment ? (
                <Text style={styles.moderationComment}>
                  {PRODUCT_MODERATION_PAGE_UI.REJECTION_COMMENT_PREFIX} {moderationRejectionComment}
                </Text>
              ) : null}
              <ProductCardModerationPreviewFields product={product} />
            </>
          ) : (
            <>
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
                  isMineMode={isMineMode}
                  isLoyaltyPointsOvercommitted={isLoyaltyPointsOvercommitted}
                />
              </View>

              <View
                style={isCatalogGrid ? styles.sellerRowCatalogGrid : undefined}
                accessibilityLabel={isMineMode ? PRODUCT_CARD_UI.PREVIEW_FIELDS_ARIA : undefined}
              >
                <ProductCardSellerRow product={product} />
              </View>

              {showModerationBadge ? (
                <Text
                  style={[
                    styles.moderationBadge,
                    moderationBadgeVariant === "pending" && styles.moderationBadgePending,
                    moderationBadgeVariant === "approved" && styles.moderationBadgeApproved,
                    moderationBadgeVariant === "rejected" && styles.moderationBadgeRejected,
                  ]}
                  accessibilityRole="text"
                  accessibilityLabel={moderationBadgeLabel}
                >
                  {moderationBadgeLabel}
                </Text>
              ) : null}
              {moderationRejectionComment ? (
                <Text style={styles.moderationComment}>
                  {PRODUCT_MODERATION_PAGE_UI.REJECTION_COMMENT_PREFIX} {moderationRejectionComment}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </Pressable>

      {showSellerFooter ? (
        <View style={styles.footerActions}>
          <ProductCardSellerToolbar
            onPromote={onPromoteProduct}
            onEdit={onEditProduct}
            canEdit={canSellerEditProduct(product)}
            isDeletePending={isDeletePending}
            isAvailabilityTogglePending={isAvailabilityTogglePending}
            isAuctionTogglePending={isAuctionTogglePending}
          />
        </View>
      ) : null}

      {isModerationQueue && moderationActions ? (
        <View style={styles.footerActions}>
          <ProductModerationDetailsFooter {...moderationActions} />
        </View>
      ) : null}

      {showWishlistToggle ? (
        <View style={styles.wishlistSlot}>
          <WishlistToggleButton productId={product._id} product={product} variant="card" />
        </View>
      ) : null}
    </View>
  );
};
