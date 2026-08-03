import {
  INSTALLMENT_UI,
  PRODUCT_COMPARE_UI,
  PRODUCT_PRICE_OFFER_UI,
  PRODUCT_SIMILAR_UI,
} from "../../../../shared/config/appUiCopy.js";
import { ModalSectionTabs } from "../../../../shared/ui/ModalSectionTabs/ModalSectionTabs.jsx";

/**
 * @param {{
 *   detailsTab: 'details' | 'auction' | 'reviews' | 'qa' | 'installment' | 'similar' | 'compare';
 *   setDetailsTab: (tab: 'details' | 'auction' | 'reviews' | 'qa' | 'installment' | 'similar' | 'compare') => void;
 *   showAuctionTab: boolean;
 *   showInstallmentTab: boolean;
 *   showReviewsTab: boolean;
 *   showQaTab: boolean;
 *   showSimilarTab: boolean;
 *   showCompareTab: boolean;
 *   reviewsTabLabel: string;
 *   qaTabLabel: string;
 * }} props
 */
export function ProductDetailsModalTabs({
  detailsTab,
  setDetailsTab,
  showAuctionTab,
  showInstallmentTab,
  showReviewsTab,
  showQaTab,
  showSimilarTab,
  showCompareTab,
  reviewsTabLabel,
  qaTabLabel,
}) {
  /** @type {Array<{ id: 'details' | 'auction' | 'reviews' | 'qa' | 'installment' | 'similar' | 'compare'; label: string }>} */
  const tabs = [{ id: "details", label: PRODUCT_PRICE_OFFER_UI.TAB_DETAILS }];

  if (showReviewsTab) {
    tabs.push({ id: "reviews", label: reviewsTabLabel });
  }

  if (showQaTab) {
    tabs.push({ id: "qa", label: qaTabLabel });
  }

  if (showSimilarTab) {
    tabs.push({ id: "similar", label: PRODUCT_SIMILAR_UI.TAB });
  }

  if (showCompareTab) {
    tabs.push({ id: "compare", label: PRODUCT_COMPARE_UI.TAB });
  }

  if (showInstallmentTab) {
    tabs.push({ id: "installment", label: INSTALLMENT_UI.TAB });
  }

  if (showAuctionTab) {
    tabs.push({ id: "auction", label: PRODUCT_PRICE_OFFER_UI.TAB_AUCTION });
  }

  return (
    <div className="product-details-modal__tabs">
      <ModalSectionTabs
        tabs={tabs}
        activeTabId={detailsTab}
        onTabChange={setDetailsTab}
      />
    </div>
  );
}
