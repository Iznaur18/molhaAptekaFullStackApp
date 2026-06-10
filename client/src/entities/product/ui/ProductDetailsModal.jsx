import { APP_SHELL_MOBILE_NAV_BREAKPOINT_PX } from "../../../app/lib/appShellMobileNavConstants.js";
import { useMaxWidthMediaQuery } from "../../../shared/lib/useMaxWidthMediaQuery.js";
import { useSwipeRightToDismiss } from "../../../shared/lib/useSwipeRightToDismiss.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { ProductDetailsModalPurchaseActions } from "./product-details-modal/ProductDetailsModalPurchaseActions.jsx";
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

  const isMobileNav = useMaxWidthMediaQuery(APP_SHELL_MOBILE_NAV_BREAKPOINT_PX);

  useSwipeRightToDismiss(ctrl.modalBodyRef, {
    enabled:
      isOpen && Boolean(product) && isMobileNav && !ctrl.galleryLightboxOpen,
    onDismiss: onClose,
  });

  if (!isOpen || !product) return null;

  const title = product.productName?.trim() || "Товар";
  const showMobilePurchaseDock =
    isMobileNav && ctrl.detailsTab === "details" && ctrl.showPriceBlock;
  const mobilePurchaseDock = showMobilePurchaseDock ? (
    <ProductDetailsModalPurchaseActions
      productId={String(product._id)}
      isAuthorized={isAuthorized}
      onRequestLogin={onRequestLogin}
      purchaseLimit={ctrl.purchaseLimit}
      canShowAddToCart={ctrl.canShowAddToCart}
      auctionUi={ctrl.auctionUi}
      installmentUi={ctrl.installmentUi}
      onAuctionClick={ctrl.handleAuctionShortcutClick}
      onInstallmentClick={ctrl.handleInstallmentShortcutClick}
      className="product-details-modal__price-actions--mobile-dock"
    />
  ) : null;
  const hasDesktopFooter = !isMobileNav && (secondaryFooter || adminFooter);
  const modalFooter = hasDesktopFooter ? (
    <div className="product-details-modal__footer-actions">
      {adminFooter}
      {secondaryFooter}
    </div>
  ) : null;
  const hasMobileInlineActions =
    isMobileNav && (secondaryFooter || adminFooter) && ctrl.detailsTab === "details";
  const isAltDetailsTab =
    ctrl.detailsTab === "reviews" ||
    ctrl.detailsTab === "auction" ||
    ctrl.detailsTab === "installment";
  const tabPanelClassName = [
    "product-details-modal__tab-panel",
    isMobileNav && isAltDetailsTab ? "product-details-modal__tab-panel--inset" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleId="product-details-modal-title"
      size="lg"
      hideHeader={isMobileNav}
      panelClassName={[
        "product-details-modal",
        showMobilePurchaseDock ? "product-details-modal--mobile-dock-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      bodyClassName="product-details-modal__body"
      bodyRef={ctrl.modalBodyRef}
      footer={modalFooter}
      dockedFooter={mobilePurchaseDock}
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
        className={tabPanelClassName}
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
          isPremiumUser={isPremiumUser}
          onRequestLogin={onRequestLogin}
          ctrl={ctrl}
        />
      </div>

      {hasMobileInlineActions ? (
        <div className="product-details-modal__mobile-inline-actions">
          {adminFooter}
          {secondaryFooter}
        </div>
      ) : null}
    </ProductModalShell>
  );
}
