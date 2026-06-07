import {
  INSTALLMENT_UI,
  PRODUCT_PRICE_OFFER_UI,
} from "../../../../shared/config/appUiCopy.js";

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
  return (
    <div className="product-details-modal__tabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={detailsTab === "details"}
        className={
          detailsTab === "details"
            ? "product-details-modal__tab product-details-modal__tab_active"
            : "product-details-modal__tab"
        }
        onClick={() => setDetailsTab("details")}
      >
        {PRODUCT_PRICE_OFFER_UI.TAB_DETAILS}
      </button>
      {showAuctionTab ? (
        <button
          type="button"
          role="tab"
          aria-selected={detailsTab === "auction"}
          className={
            detailsTab === "auction"
              ? "product-details-modal__tab product-details-modal__tab_active"
              : "product-details-modal__tab"
          }
          onClick={() => setDetailsTab("auction")}
        >
          {PRODUCT_PRICE_OFFER_UI.TAB_AUCTION}
        </button>
      ) : null}
      {showInstallmentTab ? (
        <button
          type="button"
          role="tab"
          aria-selected={detailsTab === "installment"}
          className={
            detailsTab === "installment"
              ? "product-details-modal__tab product-details-modal__tab_active"
              : "product-details-modal__tab"
          }
          onClick={() => setDetailsTab("installment")}
        >
          {INSTALLMENT_UI.TAB}
        </button>
      ) : null}
      {showReviewsTab ? (
        <button
          type="button"
          role="tab"
          aria-selected={detailsTab === "reviews"}
          className={
            detailsTab === "reviews"
              ? "product-details-modal__tab product-details-modal__tab_active"
              : "product-details-modal__tab"
          }
          onClick={() => setDetailsTab("reviews")}
        >
          {reviewsTabLabel}
        </button>
      ) : null}
    </div>
  );
}
