import { useMemo, useState } from "react";

import { PRODUCT_UI } from "@/shared/config";

import { isCurrentUserProductSeller } from "../lib/isCurrentUserProductSeller";
import { resolveAuctionUiState } from "../lib/resolveAuctionUiState";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants";

export type ProductDetailTabId = "details" | "reviews" | "auction" | "installment";

type UseProductDetailTabsOptions = {
  product: Record<string, unknown> | null | undefined;
  currentUserId: string | null;
};

export const useProductDetailTabs = ({ product, currentUserId }: UseProductDetailTabsOptions) => {
  const [activeTab, setActiveTab] = useState<ProductDetailTabId>("details");

  const isOwnProduct = product != null && isCurrentUserProductSeller(product, currentUserId);
  const auctionUi = useMemo(() => resolveAuctionUiState(product), [product]);

  const showReviewsTab =
    product?._id != null &&
    (product.productModerationStatus === PRODUCT_MODERATION_APPROVED || isOwnProduct);
  const showAuctionTab =
    product?._id != null &&
    (isOwnProduct ? auctionUi.showSellerAuctionTab : product.productAuctionEnabled === true);
  const showInstallmentTab =
    product?._id != null &&
    (isOwnProduct
      ? product.productInstallmentEnabled === true
      : product.productInstallmentEnabled === true);
  const showTabs = showReviewsTab || showAuctionTab || showInstallmentTab;

  const tabs = useMemo(() => {
    const items: { id: ProductDetailTabId; label: string }[] = [
      { id: "details", label: PRODUCT_UI.TAB_DETAILS },
    ];
    if (showReviewsTab) items.push({ id: "reviews", label: PRODUCT_UI.TAB_REVIEWS });
    if (showAuctionTab) items.push({ id: "auction", label: PRODUCT_UI.TAB_AUCTION });
    if (showInstallmentTab) items.push({ id: "installment", label: PRODUCT_UI.TAB_INSTALLMENT });
    return items;
  }, [showAuctionTab, showInstallmentTab, showReviewsTab]);

  return {
    activeTab,
    setActiveTab,
    tabs,
    showTabs,
    isOwnProduct,
    auctionUi,
  };
};
