import { useCallback, useEffect, useMemo, useRef } from "react";

import { useRecordProductViewMutation } from "../../model/useRecordProductViewMutation.js";
import { resolveProductImageUrls } from "../../lib/resolveProductImageUrls.js";
import { resolveProductPreviewVideoUrl } from "../../lib/resolveProductPreviewVideoUrl.js";

import {
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS_STAFF,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS_ADMIN,
} from "../../model/productConstants.js";
import { getProductFieldReadLayout } from "../../lib/productFieldRegistry.js";
import { filterProductDetailsVisibleFieldKeys } from "../../lib/isProductDetailsFieldVisible.js";
import { resolveProductDetailsContentPanels } from "../../lib/resolveProductDetailsContentPanels.js";
import { useAuthSession } from "../../../user/model/useAuthSession.js";
import { getProductPurchaseLimit } from "../../lib/getProductPurchaseLimit.js";
import { resolveProductOutOfStockOverlayLabel } from "../../lib/resolveProductOutOfStockOverlayLabel.js";
import { resolveProductPurchaseBlockState } from "../../lib/resolveProductPurchaseBlockState.js";
import { resolveProductSellerClosedPurchaseState } from "../../lib/resolveProductSellerClosedPurchaseState.js";
import { PRODUCT_QA_UI, PRODUCT_REVIEW_UI } from "../../../../shared/config/appUiCopy.js";
import { useProductDetailsModalQueries } from "./useProductDetailsModalQueries.js";
import { useProductDetailsModalTabs } from "./useProductDetailsModalTabs.js";

/**
 * @param {Parameters<import('../ProductDetailsModal.jsx').ProductDetailsModal>[0]} props
 */
export function useProductDetailsModalController({
  isOpen,
  onClose,
  product,
  onSellerNameClick,
  isAuthorized = false,
  onProductStatsUpdate,
  showStaffDetails = false,
  showAddToCart = false,
  currentUserId = null,
  initialDetailsTab = "details",
  onProfileActionBadgesChanged,
  closeBeforeSellerOpen = true,
}) {
  const imageUrls = useMemo(
    () => (product ? resolveProductImageUrls(product) : []),
    [product],
  );
  const previewVideoUrl = useMemo(
    () => (product ? resolveProductPreviewVideoUrl(product) : null),
    [product],
  );
  const { user: authUser } = useAuthSession();
  const isUserDataConfirmed = isAuthorized && authUser?.isUserDataConfirmed === true;
  const modalBodyRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const tabPanelRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const queries = useProductDetailsModalQueries({ isOpen, product });
  const tabs = useProductDetailsModalTabs({
    isOpen,
    product,
    currentUserId,
    initialDetailsTab,
    installmentProgram: queries.installmentProgram,
    tabPanelRef,
  });

  const { mutate: recordProductViewMutate } = useRecordProductViewMutation();

  const handleReviewStatsChange = useCallback(
    (stats) => {
      if (!product?._id) return;
      onProductStatsUpdate?.(String(product._id), stats);
    },
    [onProductStatsUpdate, product?._id],
  );

  useEffect(() => {
    if (!isOpen || !product?._id || !isAuthorized) return undefined;

    recordProductViewMutate(String(product._id), {
      onSuccess: ({ uniqueViewerCount }) => {
        onProductStatsUpdate?.(String(product._id), { uniqueViewerCount });
      },
    });

    return undefined;
  }, [isOpen, isAuthorized, onProductStatsUpdate, product?._id, recordProductViewMutate]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const topRowFieldKeys = showStaffDetails
    ? PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS_ADMIN
    : PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS;
  const bottomRowFieldKeys = showStaffDetails
    ? PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS_STAFF
    : PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS;
  const fieldHandlers = { onClose, onSellerNameClick };
  const handleOpenSellerProfile =
    typeof onSellerNameClick === "function"
      ? (userId) => {
          if (closeBeforeSellerOpen) {
            onClose();
          }
          onSellerNameClick(userId);
        }
      : undefined;
  const topStatFieldKeys = topRowFieldKeys.filter(
    (key) =>
      key !== "productPrice" &&
      !(tabs.isOwnProduct && key === "productWishlistCount"),
  );
  const bottomBlockFieldKeys = useMemo(() => {
    if (!product) return [];
    return filterProductDetailsVisibleFieldKeys(
      bottomRowFieldKeys.filter((key) => getProductFieldReadLayout(key) === "block"),
      product,
    );
  }, [bottomRowFieldKeys, product]);
  const bottomMetaFieldKeys = useMemo(() => {
    if (!product) return [];
    return filterProductDetailsVisibleFieldKeys(
      bottomRowFieldKeys.filter((key) => getProductFieldReadLayout(key) === "meta"),
      product,
    );
  }, [bottomRowFieldKeys, product]);
  const contentPanels = useMemo(() => {
    if (!product) return null;
    return resolveProductDetailsContentPanels(product, bottomBlockFieldKeys);
  }, [bottomBlockFieldKeys, product]);
  const hasDetailsSection = useMemo(() => {
    if (!product || !contentPanels) return false;
    return (
      contentPanels.hasContentPanels ||
      contentPanels.otherBlockFieldKeys.length > 0 ||
      bottomMetaFieldKeys.length > 0
    );
  }, [bottomMetaFieldKeys, contentPanels, product]);
  const purchaseLimit = product ? getProductPurchaseLimit(product) : 0;
  const isProductOutOfStock = product?.productOutOfStock === true;
  const { isPurchaseBlocked, blockedLabel } = resolveProductPurchaseBlockState(product);
  const { isSellerClosed, closedLabel: sellerClosedLabel } =
    resolveProductSellerClosedPurchaseState(product);
  const canShowAddToCart =
    showAddToCart &&
    product?._id != null &&
    !tabs.isOwnProduct &&
    purchaseLimit > 0 &&
    !isProductOutOfStock &&
    !isPurchaseBlocked &&
    !isSellerClosed;
  const showOutOfStockPurchaseButton =
    showAddToCart && product?._id != null && !tabs.isOwnProduct && isProductOutOfStock;
  const showBlockedPurchaseButton =
    product?._id != null && !tabs.isOwnProduct && isPurchaseBlocked;
  const showSellerClosedPurchaseButton =
    product?._id != null &&
    !tabs.isOwnProduct &&
    isSellerClosed &&
    !isPurchaseBlocked &&
    !isProductOutOfStock;
  const outOfStockPurchaseLabel = product
    ? resolveProductOutOfStockOverlayLabel(product)
    : "";

  const reviewCount = Number(product?.reviewCount) || 0;
  const reviewsTabLabel =
    reviewCount > 0
      ? PRODUCT_REVIEW_UI.TAB_REVIEWS_WITH_COUNT(reviewCount)
      : PRODUCT_REVIEW_UI.TAB_REVIEWS;

  const qaTabLabel = PRODUCT_QA_UI.TAB;

  const showPriceBlock = topRowFieldKeys.includes("productPrice");

  return {
    showPriceBlock,
    imageUrls,
    previewVideoUrl,
    modalBodyRef,
    tabPanelRef,
    isUserDataConfirmed,
    handleReviewStatsChange,
    fieldHandlers,
    handleOpenSellerProfile,
    topStatFieldKeys,
    bottomBlockFieldKeys,
    bottomMetaFieldKeys,
    contentPanels,
    hasDetailsSection,
    canShowAddToCart,
    showOutOfStockPurchaseButton,
    showBlockedPurchaseButton,
    blockedPurchaseLabel: blockedLabel,
    showSellerClosedPurchaseButton,
    sellerClosedPurchaseLabel: sellerClosedLabel,
    isPurchaseBlocked,
    outOfStockPurchaseLabel,
    purchaseLimit,
    reviewsTabLabel,
    qaTabLabel,
    onProfileActionBadgesChanged,
    ...queries,
    ...tabs,
  };
}
