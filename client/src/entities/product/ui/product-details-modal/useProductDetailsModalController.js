import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { useAuthSession } from "../../../user/model/useAuthSession.js";
import { getProductPurchaseLimit } from "../../lib/getProductPurchaseLimit.js";
import { PRODUCT_REVIEW_UI } from "../../../../shared/config/appUiCopy.js";
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
}) {
  const imageUrls = useMemo(
    () => (product ? resolveProductImageUrls(product) : []),
    [product],
  );
  const previewVideoUrl = useMemo(
    () => (product ? resolveProductPreviewVideoUrl(product) : null),
    [product],
  );
  const [galleryLightboxOpen, setGalleryLightboxOpen] = useState(false);
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
    setGalleryLightboxOpen(false);
  }, [product?._id]);

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
    if (!isOpen || galleryLightboxOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [galleryLightboxOpen, isOpen, onClose]);

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
          onClose();
          onSellerNameClick(userId);
        }
      : undefined;
  const topStatFieldKeys = topRowFieldKeys.filter((key) => key !== "productPrice");
  const bottomBlockFieldKeys = bottomRowFieldKeys.filter(
    (key) => getProductFieldReadLayout(key) === "block",
  );
  const bottomMetaFieldKeys = bottomRowFieldKeys.filter(
    (key) => getProductFieldReadLayout(key) === "meta",
  );
  const purchaseLimit = product ? getProductPurchaseLimit(product) : 0;
  const canShowAddToCart =
    showAddToCart && product?._id != null && !tabs.isOwnProduct && purchaseLimit > 0;

  const reviewCount = Number(product?.reviewCount) || 0;
  const reviewsTabLabel =
    reviewCount > 0
      ? PRODUCT_REVIEW_UI.TAB_REVIEWS_WITH_COUNT(reviewCount)
      : PRODUCT_REVIEW_UI.TAB_REVIEWS;

  const showPriceBlock = topRowFieldKeys.includes("productPrice");

  return {
    showPriceBlock,
    imageUrls,
    previewVideoUrl,
    galleryLightboxOpen,
    setGalleryLightboxOpen,
    modalBodyRef,
    tabPanelRef,
    isUserDataConfirmed,
    handleReviewStatsChange,
    fieldHandlers,
    handleOpenSellerProfile,
    topStatFieldKeys,
    bottomBlockFieldKeys,
    bottomMetaFieldKeys,
    canShowAddToCart,
    purchaseLimit,
    reviewsTabLabel,
    onProfileActionBadgesChanged,
    ...queries,
    ...tabs,
  };
}
