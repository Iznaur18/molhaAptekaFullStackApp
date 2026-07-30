import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

import { resolveAuctionUiState } from "../../lib/resolveAuctionUiState.js";
import { resolveInstallmentUiState } from "../../../installment/lib/resolveInstallmentUiState.js";
import { isCurrentUserProductSeller } from "../../lib/isCurrentUserProductSeller.js";
import { resolveProductSimilarCatalogFilters } from "../../lib/resolveProductSimilarCatalogFilters.js";
import { PRODUCT_MODERATION_APPROVED } from "../../model/productModerationConstants.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../../model/types.js").ProductFromApi | null;
 *   currentUserId: string | null;
 *   initialDetailsTab: 'details' | 'auction' | 'reviews' | 'installment' | 'similar' | 'compare';
 *   installmentProgram: import('../../../installment/model/types.js').InstallmentProgramFromApi | null;
 *   tabPanelRef: import('react').RefObject<HTMLDivElement | null>;
 * }} params
 */
export function useProductDetailsModalTabs({
  isOpen,
  product,
  currentUserId,
  initialDetailsTab,
  installmentProgram,
  tabPanelRef,
}) {
  const [detailsTab, setDetailsTab] = useState(initialDetailsTab);
  const [tabPanelMinHeight, setTabPanelMinHeight] = useState(0);

  const isOwnProduct =
    product != null && isCurrentUserProductSeller(product, currentUserId);
  const isSellerView = isOwnProduct;
  const auctionUi = useMemo(() => resolveAuctionUiState(product), [product]);
  const installmentUi = useMemo(
    () => resolveInstallmentUiState(product, installmentProgram),
    [product, installmentProgram],
  );
  const similarFilters = useMemo(
    () => resolveProductSimilarCatalogFilters(product),
    [product],
  );

  const showReviewsTab =
    product?._id != null &&
    (product.productModerationStatus === PRODUCT_MODERATION_APPROVED || isSellerView);
  const showSimilarTab = product?._id != null && similarFilters != null;
  const showCompareTab = product?._id != null;
  const showAuctionTab =
    product?._id != null &&
    (isSellerView
      ? auctionUi.showSellerAuctionTab
      : product.productAuctionEnabled === true);
  const showInstallmentTab =
    product?._id != null &&
    (isSellerView
      ? installmentUi.showInstallmentTab
      : product.productInstallmentEnabled === true || installmentUi.installmentActive);
  const showProductDetailsTabs =
    showAuctionTab ||
    showReviewsTab ||
    showInstallmentTab ||
    showSimilarTab ||
    showCompareTab;

  const handleAuctionShortcutClick = useCallback(() => {
    if (!auctionUi.auctionActive) return;
    setDetailsTab("auction");
  }, [auctionUi.auctionActive]);

  const handleInstallmentShortcutClick = useCallback(() => {
    if (
      !installmentUi.installmentActive &&
      !installmentUi.showInstallmentTab &&
      product?.productInstallmentEnabled !== true
    ) {
      return;
    }
    setDetailsTab("installment");
  }, [
    installmentUi.installmentActive,
    installmentUi.showInstallmentTab,
    product?.productInstallmentEnabled,
  ]);

  useEffect(() => {
    setDetailsTab(initialDetailsTab);
    setTabPanelMinHeight(0);
  }, [product?._id, initialDetailsTab]);

  useEffect(() => {
    if (!isOpen || !product) return;

    const showReviews =
      product._id != null &&
      (product.productModerationStatus === PRODUCT_MODERATION_APPROVED || isOwnProduct);
    const showSimilar = product._id != null && similarFilters != null;
    const showCompare = product._id != null;
    const showAuction =
      product._id != null &&
      (isSellerView ? auctionUi.showSellerAuctionTab : product.productAuctionEnabled === true);
    const showInstallment =
      product._id != null &&
      (isSellerView
        ? installmentUi.showInstallmentTab
        : product.productInstallmentEnabled === true || installmentUi.installmentActive);

    if (detailsTab === "reviews" && !showReviews) setDetailsTab("details");
    if (detailsTab === "similar" && !showSimilar) setDetailsTab("details");
    if (detailsTab === "compare" && !showCompare) setDetailsTab("details");
    if (detailsTab === "auction" && !showAuction) setDetailsTab("details");
    if (detailsTab === "installment" && !showInstallment) setDetailsTab("details");
  }, [
    auctionUi.showSellerAuctionTab,
    detailsTab,
    installmentUi.installmentActive,
    installmentUi.showInstallmentTab,
    isOpen,
    isOwnProduct,
    isSellerView,
    product,
    similarFilters,
  ]);

  useLayoutEffect(() => {
    if (!isOpen || !showProductDetailsTabs) {
      setTabPanelMinHeight(0);
      return undefined;
    }

    const panel = tabPanelRef.current;
    if (!panel) return undefined;

    const measureNaturalHeight = () => {
      const inlineMinHeight = panel.style.minHeight;
      panel.style.removeProperty("min-height");
      const naturalHeight = panel.scrollHeight;
      if (inlineMinHeight) {
        panel.style.minHeight = inlineMinHeight;
      }
      return naturalHeight;
    };

    const commitMaxHeight = (naturalHeight) => {
      if (naturalHeight <= 0) {
        return;
      }
      setTabPanelMinHeight((prev) => Math.max(prev, naturalHeight));
    };

    commitMaxHeight(measureNaturalHeight());

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      commitMaxHeight(measureNaturalHeight());
    });
    observer.observe(panel);

    return () => {
      observer.disconnect();
    };
  }, [isOpen, showProductDetailsTabs, detailsTab, product?._id, tabPanelRef]);

  return {
    detailsTab,
    setDetailsTab,
    tabPanelMinHeight,
    isOwnProduct,
    isSellerView,
    auctionUi,
    installmentUi,
    showReviewsTab,
    showSimilarTab,
    showCompareTab,
    showAuctionTab,
    showInstallmentTab,
    showProductDetailsTabs,
    handleAuctionShortcutClick,
    handleInstallmentShortcutClick,
  };
}
