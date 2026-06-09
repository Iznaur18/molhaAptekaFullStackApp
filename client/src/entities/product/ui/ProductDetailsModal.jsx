import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { ProductDetailsModalTabPanel } from "./product-details-modal/ProductDetailsModalTabPanel.jsx";
import { ProductDetailsModalTabs } from "./product-details-modal/ProductDetailsModalTabs.jsx";
import { useProductDetailsModalController } from "./product-details-modal/useProductDetailsModalController.js";

import "./ProductDetailsModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onSellerNameClick?: (userId: string) => void;
 *   isAuthorized?: boolean;
 *   onProductStatsUpdate?: (
 *     productId: string,
 *     stats: {
 *       uniqueViewerCount?: number;
 *       averageRating?: number;
 *       reviewCount?: number;
 *     },
 *   ) => void;
 *   adminFooter?: import('react').ReactNode;
 *   showStaffDetails?: boolean;
 *   showAddToCart?: boolean;
 *   onRequestLogin?: () => void;
 *   secondaryFooter?: import('react').ReactNode;
 *   currentUserId?: string | null;
 *   initialDetailsTab?: 'details' | 'auction' | 'reviews' | 'installment';
 *   isPremiumUser?: boolean;
 *   onProfileActionBadgesChanged?: () => void;
 * }} props
 */
export function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onSellerNameClick,
  isAuthorized = false,
  onProductStatsUpdate,
  adminFooter = null,
  secondaryFooter = null,
  showStaffDetails = false,
  showAddToCart = false,
  onRequestLogin = () => {},
  currentUserId = null,
  initialDetailsTab = "details",
  isPremiumUser = false,
  onProfileActionBadgesChanged,
}) {
  const ctrl = useProductDetailsModalController({
    isOpen,
    onClose,
    product,
    onSellerNameClick,
    isAuthorized,
    onProductStatsUpdate,
    showStaffDetails,
    showAddToCart,
    currentUserId,
    initialDetailsTab,
    onProfileActionBadgesChanged,
  });

  if (!isOpen || !product) return null;

  const title = product.productName?.trim() || "Товар";
  const modalFooter =
    secondaryFooter || adminFooter ? (
      <div className="product-details-modal__footer-actions">
        {adminFooter}
        {secondaryFooter}
      </div>
    ) : null;

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleId="product-details-modal-title"
      size="lg"
      panelClassName="product-details-modal"
      bodyClassName="product-details-modal__body"
      bodyRef={ctrl.modalBodyRef}
      footer={modalFooter}
      footerClassName="product-details-modal__footer"
      closeOnEscape={false}
    >
      {ctrl.showProductDetailsTabs ? (
        <ProductDetailsModalTabs
          detailsTab={ctrl.detailsTab}
          setDetailsTab={ctrl.setDetailsTab}
          showAuctionTab={ctrl.showAuctionTab}
          showInstallmentTab={ctrl.showInstallmentTab}
          showReviewsTab={ctrl.showReviewsTab}
          reviewsTabLabel={ctrl.reviewsTabLabel}
        />
      ) : null}

      <div
        ref={ctrl.tabPanelRef}
        className="product-details-modal__tab-panel"
        style={
          ctrl.showProductDetailsTabs && ctrl.tabPanelMinHeight > 0
            ? { minHeight: `${ctrl.tabPanelMinHeight}px` }
            : undefined
        }
      >
        <ProductDetailsModalTabPanel
          product={product}
          isOpen={isOpen}
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          ctrl={ctrl}
        />
      </div>
    </ProductModalShell>
  );
}
