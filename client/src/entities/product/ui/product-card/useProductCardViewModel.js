import { formatCatalogNearDistanceLabel } from "@molha/api-contract";
import { useId, useMemo } from "react";

import { useHorizontalPointerDragScroll } from "../../../../shared/lib/useHorizontalPointerDragScroll.js";
import { formatProductFieldForDisplay } from "../../lib/formatProductFieldForDisplay.js";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
  shouldShowProductModerationPendingOverlay,
} from "../../lib/getProductModerationUi.js";
import { getProductPurchaseLimit } from "../../lib/getProductPurchaseLimit.js";
import { getProductPromotionTierLabel } from "../../lib/calculateProductPromotionPointsCost.js";
import { formatPromotionExpiresAt } from "../../lib/productPromotionStatus.js";
import {
  formatProductReviewRatingLine,
  getProductReviewRatingParts,
} from "../../../product-review/lib/formatProductReviewRatingLine.js";
import {
  PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS,
  PRODUCT_CARD_PREVIEW_FIELD_KEYS,
} from "../../model/productConstants.js";
import { PRODUCT_MODERATION_REJECTED } from "../../model/productModerationConstants.js";
import { resolveProductCardHeadingId } from "../../lib/resolveProductCardHeadingId.js";
import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";
import { useProductCardChromeFlags } from "./useProductCardChromeFlags.js";
import { useProductCardMediaState } from "./useProductCardMediaState.js";

/**
 * @param {Parameters<import('../ProductCard.jsx').ProductCard>[0]} props
 */
export function useProductCardViewModel(props) {
  const {
    product,
    onSellerNameClick,
    onDeleteProduct,
    onEditProduct,
    isDeletePending = false,
    onSetProductAvailability,
    onSetProductAuction,
    isAvailabilityTogglePending = false,
    isAuctionTogglePending = false,
    onPromoteProduct,
    sellerRaffleActive = false,
    onToggleRaffleParticipation,
    isRaffleParticipationPending = false,
    onOpenDetails,
    isAuthorized = false,
    isPremiumUser = false,
    currentUserId = null,
    onRequestLoginAddToCart = () => {},
    isMineMode = false,
    isModerationQueue = false,
    moderationActions = null,
    isLoyaltyPointsOvercommitted = false,
  } = props;

  const { ref: statusBadgesRowRef, dragScrollProps: statusBadgesDragScrollProps } =
    useHorizontalPointerDragScroll();

  const fallbackHeadingId = useId();
  const heading = product.productName?.trim() || PRODUCT_CARD_UI.DEFAULT_TITLE;
  const headingId = resolveProductCardHeadingId(product._id) ?? fallbackHeadingId;
  const isDetailsSurfaceInteractive = !isModerationQueue && onOpenDetails != null;

  const media = useProductCardMediaState(product);
  const chrome = useProductCardChromeFlags(props, currentUserId);

  const previewFieldKeys = useMemo(() => {
    if (isModerationQueue) return PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS;
    return PRODUCT_CARD_PREVIEW_FIELD_KEYS;
  }, [isModerationQueue]);

  const sellerCanEdit = !isMineMode || canSellerEditProduct(product);
  const sellerCanDelete = !isMineMode || canSellerDeleteProduct(product);
  const sellerCanToggleVisibility =
    !isMineMode || canSellerToggleCatalogVisibility(product);
  const showModerationPendingOverlay = shouldShowProductModerationPendingOverlay(product, {
    isMineMode,
    isModerationQueue,
  });
  const rejectionComment =
    isMineMode &&
    product.productModerationStatus === PRODUCT_MODERATION_REJECTED &&
    String(product.productModerationComment ?? "").trim() !== ""
      ? String(product.productModerationComment).trim()
      : "";

  const reviewRatingParts = getProductReviewRatingParts(
    product.averageRating ?? 0,
    product.reviewCount ?? 0,
  );
  const reviewRatingLine = formatProductReviewRatingLine(
    product.averageRating ?? 0,
    product.reviewCount ?? 0,
  );
  const previewFieldKeysWithoutPrice = useMemo(
    () => previewFieldKeys.filter((key) => key !== "productPrice"),
    [previewFieldKeys],
  );
  const purchaseLimit = getProductPurchaseLimit(product);
  const sellerDisplayName = formatProductFieldForDisplay("productSeller", product);
  const nearDistanceLabel = formatCatalogNearDistanceLabel(product.distanceMeters);
  const bodyClassName = isModerationQueue
    ? "product-card__body"
    : "product-card__details-surface";

  return {
    product,
    nearDistanceLabel,
    onSellerNameClick,
    onDeleteProduct,
    onEditProduct,
    isDeletePending,
    onPromoteProduct,
    onOpenDetails,
    isAuthorized,
    isPremiumUser,
    currentUserId,
    onRequestLoginAddToCart,
    isMineMode,
    isModerationQueue,
    moderationActions,
    heading,
    headingId,
    isDetailsSurfaceInteractive,
    ...media,
    sellerCanEdit,
    sellerCanDelete,
    sellerCanToggleVisibility,
    rejectionComment,
    showModerationPendingOverlay,
    reviewRatingParts,
    reviewRatingLine,
    hasReviewRating: reviewRatingParts != null,
    previewFieldKeysWithoutPrice,
    purchaseLimit,
    sellerDisplayName,
    bodyClassName,
    isAvailabilityTogglePending,
    isAuctionTogglePending,
    sellerRaffleActive,
    onToggleRaffleParticipation,
    isRaffleParticipationPending,
    onSetProductAvailability,
    onSetProductAuction,
    isLoyaltyPointsOvercommitted,
    statusBadgesRowRef,
    statusBadgesDragScrollProps,
    getPromotionTierLabel: () => getProductPromotionTierLabel(chrome.promotionTier),
    getPromotionUntil: () => formatPromotionExpiresAt(product.catalogPromotionExpiresAt),
    ...chrome,
  };
}
