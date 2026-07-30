import { ProductDetailsModalAuctionTab } from "./ProductDetailsModalAuctionTab.jsx";
import { ProductDetailsModalCompareTab } from "./ProductDetailsModalCompareTab.jsx";
import { ProductDetailsModalDetailsTab } from "./ProductDetailsModalDetailsTab.jsx";
import { ProductDetailsModalInstallmentTab } from "./ProductDetailsModalInstallmentTab.jsx";
import { ProductDetailsModalReviewsTab } from "./ProductDetailsModalReviewsTab.jsx";
import { ProductDetailsModalSimilarTab } from "./ProductDetailsModalSimilarTab.jsx";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isOpen: boolean;
 *   isAuthorized: boolean;
 *   isPremiumUser?: boolean;
 *   onRequestLogin: () => void;
 *   onProductStatsUpdate?: (
 *     productId: string,
 *     stats: { productWishlistCount?: number },
 *   ) => void;
 *   currentUserId?: string | null;
 *   mobileReportOverlay?: import('react').ReactNode;
 *   productTitleId?: string;
 *   embedMediaGallery?: boolean;
 *   showInlinePurchaseActions?: boolean;
 *   dockSubmit?: boolean;
 *   ctrl: ReturnType<import('./useProductDetailsModalController.js').useProductDetailsModalController>;
 * }} props
 */
export function ProductDetailsModalTabPanel({
  product,
  isOpen,
  isAuthorized,
  isPremiumUser = false,
  onRequestLogin,
  onProductStatsUpdate,
  currentUserId = null,
  mobileReportOverlay = null,
  productTitleId,
  embedMediaGallery = true,
  showInlinePurchaseActions = false,
  dockSubmit = false,
  ctrl,
}) {
  const {
    detailsTab,
    isUserDataConfirmed,
    isOwnProduct,
    isSellerView,
    auctionUi,
    fieldHandlers,
    installmentUi,
    installmentProgram,
    isInstallmentProgramLoading,
    topOffers,
    showReviewsTab,
    showSimilarTab,
    showCompareTab,
    showAuctionTab,
    showInstallmentTab,
    handleReviewStatsChange,
    handleOpenSellerProfile,
    onProfileActionBadgesChanged,
    refreshTopOffers,
    refreshInstallmentProgram,
  } = ctrl;

  const productId = String(product._id);
  const onOffersChanged = () => {
    refreshTopOffers();
    onProfileActionBadgesChanged?.();
  };
  const onInstallmentSuccess = () => {
    refreshInstallmentProgram();
    onProfileActionBadgesChanged?.();
  };

  if (detailsTab === "reviews" && showReviewsTab) {
    return (
      <ProductDetailsModalReviewsTab
        productId={productId}
        isAuthorized={isAuthorized}
        isUserDataConfirmed={isUserDataConfirmed}
        isOwnProduct={isOwnProduct}
        onRequestLogin={onRequestLogin}
        onStatsChange={handleReviewStatsChange}
      />
    );
  }

  if (detailsTab === "similar" && showSimilarTab) {
    return (
      <ProductDetailsModalSimilarTab
        product={product}
        excludeProductId={productId}
        enabled={isOpen}
        isAuthorized={isAuthorized}
        onRequestLoginAddToCart={onRequestLogin}
        currentUserId={currentUserId}
      />
    );
  }

  if (detailsTab === "compare" && showCompareTab) {
    return (
      <ProductDetailsModalCompareTab
        productId={productId}
        enabled={isOpen}
        isAuthorized={isAuthorized}
        onRequestLoginAddToCart={onRequestLogin}
        currentUserId={currentUserId}
      />
    );
  }

  if (detailsTab === "auction" && showAuctionTab) {
    return (
      <ProductDetailsModalAuctionTab
        productId={productId}
        isSellerView={isSellerView}
        auctionUi={auctionUi}
        topOffers={topOffers}
        isAuthorized={isAuthorized}
        isUserDataConfirmed={isUserDataConfirmed}
        isOwnProduct={isOwnProduct}
        onOpenSellerProfile={handleOpenSellerProfile}
        onRequestLogin={onRequestLogin}
        onOffersChanged={onOffersChanged}
        onCloseModal={fieldHandlers.onClose}
        showSellerArchive={false}
      />
    );
  }

  if (detailsTab === "installment" && showInstallmentTab) {
    return (
      <ProductDetailsModalInstallmentTab
        product={product}
        isSellerView={isSellerView}
        installmentUi={installmentUi}
        installmentProgram={installmentProgram}
        isInstallmentProgramLoading={isInstallmentProgramLoading}
        isAuthorized={isAuthorized}
        isUserDataConfirmed={isUserDataConfirmed}
        onRequestLogin={onRequestLogin}
        onSuccess={onInstallmentSuccess}
        dockSubmit={dockSubmit}
      />
    );
  }

  return (
    <>
      <ProductDetailsModalDetailsTab
        product={product}
        isOpen={isOpen}
        isAuthorized={isAuthorized}
        isPremiumUser={isPremiumUser}
        onRequestLogin={onRequestLogin}
        onProductStatsUpdate={onProductStatsUpdate}
        currentUserId={currentUserId}
        mobileReportOverlay={embedMediaGallery ? mobileReportOverlay : null}
        productTitleId={productTitleId}
        embedMediaGallery={embedMediaGallery}
        showInlinePurchaseActions={showInlinePurchaseActions}
        ctrl={ctrl}
      />
      {isSellerView && auctionUi.showSellerArchive ? (
        <ProductDetailsModalAuctionTab
          productId={productId}
          isSellerView
          auctionUi={auctionUi}
          topOffers={topOffers}
          isAuthorized={isAuthorized}
          isUserDataConfirmed={isUserDataConfirmed}
          isOwnProduct={isOwnProduct}
          onOpenSellerProfile={handleOpenSellerProfile}
          onRequestLogin={onRequestLogin}
          onOffersChanged={onOffersChanged}
          showSellerArchive
        />
      ) : null}
    </>
  );
}
