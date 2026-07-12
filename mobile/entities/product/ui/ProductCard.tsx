import { useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { formatProductReviewRatingLine } from "@/entities/product-review/lib/formatProductReviewRatingLine";
import {
  canSellerEditProduct,
  getProductModerationBadgeLabel,
  getProductModerationBadgeVariant,
  getProductModerationRejectionComment,
  shouldShowProductModerationPendingOverlay,
} from "@/entities/product/lib/getProductModerationUi";
import { isCurrentUserProductSeller } from "@/entities/product/lib/isCurrentUserProductSeller";
import { useProductCardImageTapActions } from "@/entities/product/lib/useProductCardImageTapActions";
import { useProductCardPressFeedback } from "@/entities/product/lib/useProductCardPressFeedback";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { resolveProductCardPromotionFrameStyle } from "@/entities/product/lib/resolveProductCardPromotionFrameStyle";
import { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { ProductCardGalleryDots } from "@/entities/product/ui/ProductCardGalleryDots";
import { ProductCardWishlistBurst } from "@/entities/product/ui/ProductCardWishlistBurst";
import { ProductCardPromotionBackground } from "@/entities/product/ui/ProductCardPromotionBackground";
import { ProductCardPromotionCornerFlag } from "@/entities/product/ui/ProductCardPromotionCornerFlag";
import { ProductCatalogStatusBadges } from "@/entities/product/ui/ProductCatalogStatusBadges";
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
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
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

export const ProductCard = memo(({
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
  const sessionQuery = useAuthSessionQuery();
  const { isInWishlist, toggleItem } = useWishlist();
  const { cardAnimatedStyle, onCardPressIn, onCardPressOut } = useProductCardPressFeedback();
  const [wishlistBurstToken, setWishlistBurstToken] = useState(0);
  const flags = useProductCardChromeFlags(product, {
    promotionFullWidth,
    highlightCatalogPromotion,
    isMineMode,
    isModerationQueue,
  });
  const cardMedia = useProductCardMediaState(product);
  const showWishlistToggle = !isMineMode && !isModerationQueue;
  const currentUserId = sessionQuery.data?.user?._id ?? null;
  const canDoubleTapWishlist =
    showWishlistToggle && !isCurrentUserProductSeller(product, currentUserId);

  const handlePress = useCallback(() => {
    router.push({ pathname: "/product/[id]", params: { id: product._id } });
  }, [product._id, router]);

  const handleDoubleTapWishlist = useCallback(() => {
    if (!isAuthorized) {
      router.push("/(auth)/login");
      return;
    }
    toggleItem(product._id);
    setWishlistBurstToken((token) => token + 1);
  }, [isAuthorized, product._id, router, toggleItem]);

  const handleImagePress = useProductCardImageTapActions({
    onOpen: handlePress,
    onDoubleTap: handleDoubleTapWishlist,
    doubleTapEnabled: canDoubleTapWishlist,
  });

  const cardPressHandlers = {
    onPressIn: onCardPressIn,
    onPressOut: onCardPressOut,
  };

  if (flags.showBannerLayout) {
    return <ProductCardBanner product={product} />;
  }

  const name = product.productName?.trim() || "Без названия";
  const reviewLine = formatProductReviewRatingLine(product.averageRating, product.reviewCount);
  const hasReviewRating = reviewLine.length > 0;
  const openProductLabel = PRODUCT_UI.OPEN_ARIA(name);

  const cardMediaStyles = useProductCardMediaStyles();
  const gallerySlideCount = Math.max(cardMedia.mediaSlides.length, 1);

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
  const isWishlisted = isInWishlist(product._id);

  return (
    <Animated.View
      style={[
        styles.card,
        isCatalogGrid && styles.cardCatalogGrid,
        isCatalogGrid && isModerationQueue && styles.cardCatalogGridModerationQueue,
        promotionFrameStyle,
        cardAnimatedStyle,
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
              onPress={handleImagePress}
              {...cardPressHandlers}
              accessibilityRole="button"
              accessibilityLabel={openProductLabel}
              accessibilityHint={
                canDoubleTapWishlist ? PRODUCT_CARD_UI.DOUBLE_TAP_WISHLIST_HINT : undefined
              }
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

        {showPromotionFrame && flags.promotionFrameTier ? (
          <ProductCardPromotionCornerFlag tier={flags.promotionFrameTier} />
        ) : null}

        {flags.showDiscountBadge || flags.showLoyaltyPointsBadge ? (
          <View style={styles.imageBadges} pointerEvents="box-none">
            {flags.showDiscountBadge ? (
              <ProductDiscountBadge product={product} variant="overlay" />
            ) : null}
            {flags.showLoyaltyPointsBadge ? (
              <ProductLoyaltyPointsBadge
                product={product}
                isAuthorized={isAuthorized}
                variant="overlay"
              />
            ) : null}
          </View>
        ) : null}

        <ProductCardWishlistBurst burstToken={wishlistBurstToken} active={isWishlisted} />

        <ProductCardGalleryDots
          slideIndex={cardMedia.cardSlideIndex}
          slideCount={cardMedia.mediaSlides.length}
        />
      </View>

      <View style={[styles.content, isCatalogGrid && styles.contentCatalogGrid]}>
        <Pressable
          style={styles.contentPressable}
          onPress={handlePress}
          {...cardPressHandlers}
          accessibilityRole="button"
          accessibilityLabel={openProductLabel}
        >
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
          ) : null}
        </Pressable>

        {!isModerationQueue ? (
          <>
            <View style={[styles.metaStrip, isCatalogGrid && styles.metaStripCatalogGrid]}>
              <Pressable
                style={styles.contentPressable}
                onPress={handlePress}
                {...cardPressHandlers}
                accessibilityRole="button"
                accessibilityLabel={openProductLabel}
                importantForAccessibility="no-hide-descendants"
              >
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
              </Pressable>

              <ProductCatalogStatusBadges
                product={product}
                showHiddenBadge={product.productIsAvailable === false}
                isMineMode={isMineMode}
                isLoyaltyPointsOvercommitted={isLoyaltyPointsOvercommitted}
              />
            </View>

            <Pressable
              style={styles.contentPressable}
              onPress={handlePress}
              {...cardPressHandlers}
              accessibilityRole="button"
              accessibilityLabel={openProductLabel}
              importantForAccessibility="no-hide-descendants"
            >
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
            </Pressable>
          </>
        ) : null}
      </View>

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
    </Animated.View>
  );
});

ProductCard.displayName = "ProductCard";
