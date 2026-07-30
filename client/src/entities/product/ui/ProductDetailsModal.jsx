import { useState } from "react";

import { useAppShellCompactLayout } from "../../../shared/lib/useAppShellCompactLayout.js";
import { useSwipeRightToDismiss } from "../../../shared/lib/useSwipeRightToDismiss.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { ProductDetailsModalPinnedGallery } from "./product-details-modal/ProductDetailsModalPinnedGallery.jsx";
import { ProductDetailsModalPurchaseActions } from "./product-details-modal/ProductDetailsModalPurchaseActions.jsx";
import { ProductDetailsModalTabPanel } from "./product-details-modal/ProductDetailsModalTabPanel.jsx";
import { ProductDetailsModalTabs } from "./product-details-modal/ProductDetailsModalTabs.jsx";
import { ProductDetailsPageDockHostContext } from "../../../shared/lib/productDetailsPageDockHostContext.js";
import { useProductDetailsModalController } from "./product-details-modal/useProductDetailsModalController.js";

import "./ProductDetailsModal.css";

/**
 * @param {{
 *   isOpen?: boolean;
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
 *       productWishlistCount?: number;
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
 *   presentation?: 'modal' | 'page';
 * }} props
 */
export function ProductDetailsModal({
  isOpen = true,
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
  presentation = "modal",
}) {
  const isPage = presentation === "page";
  const ctrl = useProductDetailsModalController({
    isOpen: isPage ? Boolean(product) : isOpen,
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
    closeBeforeSellerOpen: !isPage,
  });

  const isCompactLayout = useAppShellCompactLayout();
  /** Page always uses app-like column + sticky dock (plan 1A). */
  const isMobileNav = isPage || isCompactLayout;
  /** @type {[HTMLElement | null, import('react').Dispatch<import('react').SetStateAction<HTMLElement | null>>]} */
  const [pageDockHost, setPageDockHost] = useState(null);
  /** Как в app: галерея сверху, табы под ней, контент ниже. */
  const pinGalleryAboveTabs = isMobileNav;

  useSwipeRightToDismiss(isMobileNav ? ctrl.tabPanelRef : ctrl.modalBodyRef, {
    /* На page-экране назад — кнопка/history; свайп по галерее не должен закрывать. */
    enabled: !isPage && isOpen && Boolean(product) && isMobileNav,
    onDismiss: onClose,
  });

  if (!product) {
    return null;
  }
  if (!isPage && !isOpen) {
    return null;
  }

  const title = product.productName?.trim() || "Товар";
  const showMobilePurchaseDock =
    isMobileNav &&
    ctrl.detailsTab === "details" &&
    ctrl.showPriceBlock &&
    ctrl.canShowAddToCart;
  const showMobileInstallmentDock =
    isMobileNav &&
    ctrl.detailsTab === "installment" &&
    !ctrl.isSellerView &&
    ctrl.installmentUi.installmentActive &&
    Boolean(ctrl.installmentProgram);
  const showMobileAuctionDock =
    isMobileNav &&
    ctrl.detailsTab === "auction" &&
    !ctrl.isSellerView &&
    ctrl.auctionUi.auctionActive;
  const showMobileDock =
    showMobilePurchaseDock || showMobileInstallmentDock || showMobileAuctionDock;
  const mobilePurchaseDock = showMobilePurchaseDock ? (
    <ProductDetailsModalPurchaseActions
      productId={String(product._id)}
      isAuthorized={isAuthorized}
      onRequestLogin={onRequestLogin}
      purchaseLimit={ctrl.purchaseLimit}
      canShowAddToCart={ctrl.canShowAddToCart}
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
  const galleryReportOverlay = pinGalleryAboveTabs ? secondaryFooter : null;
  const detailsReportOverlay =
    !pinGalleryAboveTabs && isMobileNav && secondaryFooter && ctrl.detailsTab === "details"
      ? secondaryFooter
      : null;
  const hasMobileInlineActions =
    isMobileNav && adminFooter && ctrl.detailsTab === "details";
  const isAltDetailsTab =
    ctrl.detailsTab === "reviews" ||
    ctrl.detailsTab === "similar" ||
    ctrl.detailsTab === "compare" ||
    ctrl.detailsTab === "auction" ||
    ctrl.detailsTab === "installment";
  const tabPanelClassName = [
    "product-details-modal__tab-panel",
    isMobileNav && isAltDetailsTab ? "product-details-modal__tab-panel--inset" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const tabs =
    ctrl.showProductDetailsTabs ? (
      <ProductDetailsModalTabs
        detailsTab={ctrl.detailsTab}
        setDetailsTab={ctrl.setDetailsTab}
        showAuctionTab={ctrl.showAuctionTab}
        showInstallmentTab={ctrl.showInstallmentTab}
        showReviewsTab={ctrl.showReviewsTab}
        showSimilarTab={ctrl.showSimilarTab}
        showCompareTab={ctrl.showCompareTab}
        reviewsTabLabel={ctrl.reviewsTabLabel}
      />
    ) : null;

  const tabPanel = (
    <div
      ref={ctrl.tabPanelRef}
      className={tabPanelClassName}
      style={
        ctrl.showProductDetailsTabs && ctrl.tabPanelMinHeight > 0 && !isMobileNav
          ? { minHeight: `${ctrl.tabPanelMinHeight}px` }
          : undefined
      }
    >
      <ProductDetailsModalTabPanel
        product={product}
        isOpen={isPage || isOpen}
        isAuthorized={isAuthorized}
        isPremiumUser={isPremiumUser}
        onRequestLogin={onRequestLogin}
        onProductStatsUpdate={onProductStatsUpdate}
        currentUserId={currentUserId}
        mobileReportOverlay={detailsReportOverlay}
        productTitleId={isMobileNav ? undefined : "product-details-modal-title"}
        embedMediaGallery={!pinGalleryAboveTabs}
        showInlinePurchaseActions={!isMobileNav}
        dockSubmit={isMobileNav}
        ctrl={ctrl}
      />
    </div>
  );

  const body = pinGalleryAboveTabs ? (
    <>
      <ProductDetailsModalPinnedGallery
        product={product}
        isOpen={isPage || isOpen}
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onProductStatsUpdate={onProductStatsUpdate}
        currentUserId={currentUserId}
        reportOverlay={galleryReportOverlay}
        ctrl={ctrl}
      />
      {tabs}
      {tabPanel}
      {hasMobileInlineActions ? (
        <div className="product-details-modal__mobile-inline-actions">{adminFooter}</div>
      ) : null}
    </>
  ) : (
    <>
      {tabs}
      {tabPanel}
      {hasMobileInlineActions ? (
        <div className="product-details-modal__mobile-inline-actions">{adminFooter}</div>
      ) : null}
    </>
  );

  if (isPage) {
    return (
      <ProductDetailsPageDockHostContext.Provider value={pageDockHost}>
        <div
          className={[
            "product-details-page",
            "product-details-modal",
            "product-details-modal--page",
            showMobileDock ? "product-details-modal--mobile-dock-active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            ref={ctrl.modalBodyRef}
            className="product-details-modal__body product-details-page__body"
          >
            {body}
          </div>
          {showMobileDock ? (
            <div className="product-details-page__docked-footer">
              {mobilePurchaseDock ? (
                mobilePurchaseDock
              ) : (
                <div
                  className="product-details-page__docked-footer-slot"
                  ref={setPageDockHost}
                />
              )}
            </div>
          ) : null}
        </div>
      </ProductDetailsPageDockHostContext.Provider>
    );
  }

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleId="product-details-modal-title"
      size="lg"
      hideHeader
      panelClassName={[
        "product-details-modal",
        showMobileDock ? "product-details-modal--mobile-dock-active" : "",
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
      {body}
    </ProductModalShell>
  );
}
