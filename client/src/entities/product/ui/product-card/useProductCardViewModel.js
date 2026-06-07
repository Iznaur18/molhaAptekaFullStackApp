import { useId, useMemo } from "react";

import { useHorizontalPointerDragScroll } from "../../../../shared/lib/useHorizontalPointerDragScroll.js";
import { formatProductFieldForDisplay } from "../../lib/formatProductFieldForDisplay.js";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
} from "../../lib/getProductModerationUi.js";
import { getProductPurchaseLimit } from "../../lib/getProductPurchaseLimit.js";
import { getProductPromotionTierLabel } from "../../lib/calculateProductPromotionPointsCost.js";
import { formatPromotionExpiresAt } from "../../lib/productPromotionStatus.js";
import { formatProductReviewRatingLine } from "../../../product-review/lib/formatProductReviewRatingLine.js";
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

  const fallbackHeadingId = useId();
  const heading = product.productName?.trim() || PRODUCT_CARD_UI.DEFAULT_TITLE;
  const headingId = resolveProductCardHeadingId(product._id) ?? fallbackHeadingId;
  const isDetailsSurfaceInteractive = !isModerationQueue && onOpenDetails != null;

  const media = useProductCardMediaState(product);
  const chrome = useProductCardChromeFlags(props, currentUserId);

  const { ref: statusBadgesRowRef, dragScrollProps: statusBadgesDragScrollProps } =
    useHorizontalPointerDragScroll();

  const previewFieldKeys = useMemo(() => {
    if (isModerationQueue) return PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS;
    return PRODUCT_CARD_PREVIEW_FIELD_KEYS;
  }, [isModerationQueue]);

  const sellerCanEdit = !isMineMode || canSellerEditProduct(product);
  const sellerCanDelete = !isMineMode || canSellerDeleteProduct(product);
  const sellerCanToggleVisibility =
    !isMineMode || canSellerToggleCatalogVisibility(product);
  const rejectionComment =
    isMineMode &&
    product.productModerationStatus === PRODUCT_MODERATION_REJECTED &&
    String(product.productModerationComment ?? "").trim() !== ""
      ? String(product.productModerationComment).trim()
      : "";

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
  const bodyClassName = isModerationQueue
    ? "product-card__body"
    : "product-card__details-surface";

  return {
    product,
    onSellerNameClick,
    onDeleteProduct,
    onEditProduct,
    isDeletePending,
    onPromoteProduct,
    onOpenDetails,
    isAuthorized,
    isPremiumUser,
    onRequestLoginAddToCart,
    isMineMode,
    isModerationQueue,
    moderationActions,
    heading,
    headingId,
    isDetailsSurfaceInteractive,
    ...media,
    statusBadgesRowRef,
    statusBadgesDragScrollProps,
    sellerCanEdit,
    sellerCanDelete,
    sellerCanToggleVisibility,
    rejectionComment,
    reviewRatingLine,
    hasReviewRating: reviewRatingLine.length > 0,
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
    getPromotionTierLabel: () => getProductPromotionTierLabel(chrome.promotionTier),
    getPromotionUntil: () => formatPromotionExpiresAt(product.catalogPromotionExpiresAt),
    ...chrome,
  };
}
