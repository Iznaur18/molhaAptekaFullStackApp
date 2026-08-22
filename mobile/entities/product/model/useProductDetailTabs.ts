import { useMemo, useState } from "react";

import {
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_TOP_ROW_FIELD_KEYS,
} from "@/entities/product/lib/productFieldRegistry";
import { isCurrentUserProductSeller } from "@/entities/product/lib/isCurrentUserProductSeller";
import { resolveAuctionUiState } from "@/entities/product/lib/resolveAuctionUiState";
import { resolveProductSimilarCatalogFilters } from "@/entities/product/lib/resolveProductSimilarCatalogFilters";
import { PRODUCT_MODERATION_APPROVED } from "@/entities/product/model/productModerationConstants";
import {
  INSTALLMENT_UI,
  PRODUCT_PRICE_OFFER_UI,
  PRODUCT_QA_UI,
  PRODUCT_REVIEW_UI,
  PRODUCT_SIMILAR_UI,
} from "@/shared/config";

export type ProductDetailTabId =
  | "details"
  | "reviews"
  | "qa"
  | "similar"
  | "auction"
  | "installment";

type UseProductDetailTabsOptions = {
  product: Record<string, unknown> | null | undefined;
  currentUserId: string | null;
};

export const useProductDetailTabs = ({ product, currentUserId }: UseProductDetailTabsOptions) => {
  const [activeTab, setActiveTab] = useState<ProductDetailTabId>("details");

  const isOwnProduct = product != null && isCurrentUserProductSeller(product, currentUserId);
  const auctionUi = useMemo(() => resolveAuctionUiState(product), [product]);
  const installmentActive = product?.productInstallmentEnabled === true;
  const similarFilters = useMemo(() => resolveProductSimilarCatalogFilters(product), [product]);

  const showReviewsTab =
    product?._id != null &&
    (product.productModerationStatus === PRODUCT_MODERATION_APPROVED || isOwnProduct);
  const showQaTab =
    product?._id != null &&
    (isOwnProduct
      ? true
      : product.productQaEnabled === true &&
        product.productModerationStatus === PRODUCT_MODERATION_APPROVED);
  const showSimilarTab = product?._id != null && similarFilters != null;
  const showAuctionTab =
    product?._id != null &&
    (isOwnProduct ? auctionUi.showSellerAuctionTab : product.productAuctionEnabled === true);
  const showInstallmentTab =
    product?._id != null &&
    (isOwnProduct ? installmentActive : installmentActive);
  const showTabs =
    showReviewsTab ||
    showQaTab ||
    showSimilarTab ||
    showAuctionTab ||
    showInstallmentTab;

  const reviewCount = Number(product?.reviewCount) || 0;
  const reviewsTabLabel =
    reviewCount > 0
      ? PRODUCT_REVIEW_UI.TAB_REVIEWS_WITH_COUNT(reviewCount)
      : PRODUCT_REVIEW_UI.TAB_REVIEWS;

  const tabs = useMemo(() => {
    const items: { id: ProductDetailTabId; label: string }[] = [
      { id: "details", label: PRODUCT_PRICE_OFFER_UI.TAB_DETAILS },
    ];
    if (showReviewsTab) {
      items.push({ id: "reviews", label: reviewsTabLabel });
    }
    if (showQaTab) {
      items.push({ id: "qa", label: PRODUCT_QA_UI.TAB });
    }
    if (showSimilarTab) {
      items.push({ id: "similar", label: PRODUCT_SIMILAR_UI.TAB });
    }
    if (showInstallmentTab) {
      items.push({ id: "installment", label: INSTALLMENT_UI.TAB });
    }
    if (showAuctionTab) {
      items.push({ id: "auction", label: PRODUCT_PRICE_OFFER_UI.TAB_AUCTION });
    }
    return items;
  }, [
    reviewsTabLabel,
    showAuctionTab,
    showInstallmentTab,
    showQaTab,
    showReviewsTab,
    showSimilarTab,
  ]);

  const topStatFieldKeys = useMemo(() => {
    const keys = PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS.filter((key) => key !== "productPrice");
    if (isOwnProduct) {
      return keys.filter((key) => key !== "productWishlistCount");
    }
    return keys;
  }, [isOwnProduct]);

  const handleAuctionShortcut = () => {
    if (!auctionUi.auctionActive) {
      return;
    }
    setActiveTab("auction");
  };

  const handleInstallmentShortcut = () => {
    if (!installmentActive) {
      return;
    }
    setActiveTab("installment");
  };

  return {
    activeTab,
    setActiveTab,
    tabs,
    showTabs,
    isOwnProduct,
    auctionUi,
    installmentActive,
    topStatFieldKeys,
    handleAuctionShortcut,
    handleInstallmentShortcut,
  };
};

/** @deprecated use topStatFieldKeys from useProductDetailTabs */
export { PRODUCT_DETAILS_TOP_ROW_FIELD_KEYS };
