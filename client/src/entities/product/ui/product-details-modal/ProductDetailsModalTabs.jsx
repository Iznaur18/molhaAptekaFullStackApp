import {
  INSTALLMENT_UI,
  PRODUCT_PRICE_OFFER_UI,
} from "../../../../shared/config/appUiCopy.js";
import { ModalSectionTabs } from "../../../../shared/ui/ModalSectionTabs/ModalSectionTabs.jsx";

/**
 * @param {{
 *   detailsTab: 'details' | 'auction' | 'reviews' | 'installment';
 *   setDetailsTab: (tab: 'details' | 'auction' | 'reviews' | 'installment') => void;
 *   showAuctionTab: boolean;
 *   showInstallmentTab: boolean;
 *   showReviewsTab: boolean;
 *   reviewsTabLabel: string;
 * }} props
 */
export function ProductDetailsModalTabs({
  detailsTab,
  setDetailsTab,
  showAuctionTab,
  showInstallmentTab,
  showReviewsTab,
  reviewsTabLabel,
}) {
  /** @type {Array<{ id: 'details' | 'auction' | 'reviews' | 'installment'; label: string }>} */
  const tabs = [{ id: "details", label: PRODUCT_PRICE_OFFER_UI.TAB_DETAILS }];

  if (showReviewsTab) {
    tabs.push({ id: "reviews", label: reviewsTabLabel });
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
