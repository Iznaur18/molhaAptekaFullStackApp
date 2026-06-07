import { ProductDetailsModalAuctionTab } from "./ProductDetailsModalAuctionTab.jsx";
import { ProductDetailsModalDetailsTab } from "./ProductDetailsModalDetailsTab.jsx";
import { ProductDetailsModalInstallmentTab } from "./ProductDetailsModalInstallmentTab.jsx";
import { ProductDetailsModalReviewsTab } from "./ProductDetailsModalReviewsTab.jsx";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isOpen: boolean;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   ctrl: ReturnType<import('./useProductDetailsModalController.js').useProductDetailsModalController>;
 * }} props
 */
export function ProductDetailsModalTabPanel({
  product,
  isOpen,
  isAuthorized,
  onRequestLogin,
  ctrl,
}) {
  const {
    detailsTab,
    isUserDataConfirmed,
    isOwnProduct,
    isSellerView,
    auctionUi,
    installmentUi,
    installmentProgram,
    isInstallmentProgramLoading,
    topOffers,
    showReviewsTab,
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
      />
    );
  }

  return (
    <>
      <ProductDetailsModalDetailsTab
        product={product}
        isOpen={isOpen}
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
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
