import { CreateProductModal } from "../../../entities/product/ui/CreateProductModal.jsx";
import { ProductDetailsAdminFooter } from "../../../entities/product/ui/ProductDetailsAdminFooter.jsx";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import { ProductPromotionModal } from "../../../entities/product/ui/ProductPromotionModal.jsx";
import { SellerProductsLimitModal } from "../../../entities/product/ui/SellerProductsLimitModal.jsx";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
} from "../../../entities/product/lib/getProductModerationUi.js";
import { Flag } from "lucide-react";

import { CreateRaffleModal } from "../../../entities/raffle/ui/CreateRaffleModal.jsx";
import { ReportProductModal } from "../../../entities/product-report/ui/ReportProductModal.jsx";
import { PRODUCT_REPORT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {Record<string, unknown>} props
 */
export function AppShellProductModals({
  isPremiumUser,
  isSellerProductsLimitModalOpen,
  setIsSellerProductsLimitModalOpen,
  sellerProductsLimit,
  isCreateProductModalOpen,
  setIsCreateProductModalOpen,
  handleCreateProductSuccess,
  loyaltyPoints,
  loyaltyPointsReserved,
  isMineMode,
  products,
  productToEdit,
  handleCloseEditProductModal,
  handleEditProductSuccess,
  handleDeleteMyProduct,
  handleSetMyProductAvailability,
  handleSetProductAuction,
  deletingProductId,
  togglingAvailabilityProductId,
  togglingAuctionProductId,
  myProductsCatalogError,
  productDetailsAdminError,
  sellerRaffleActive,
  handleToggleRaffleParticipation,
  raffleParticipationPendingProductId,
  isAdmin,
  promotionProduct,
  promotionConfig,
  promotionModalError,
  isPromotionSubmitPending,
  handleClosePromotionModal,
  handleSubmitPromotionRequest,
  raffleModal,
  setRaffleModal,
  refreshRaffleSurfaces,
  refreshPendingRafflesCount,
  setMyProductsCatalogNotice,
  catalogProductDetails,
  setCatalogProductDetails,
  setCatalogProductDetailsTab,
  setProductDetailsAdminError,
  handleSellerNameClick,
  handleProductStatsUpdate,
  catalogDetailsShowAddToCart,
  catalogProductDetailsTab,
  refreshUserProfileActionBadgeCounts,
  canReportCatalogProduct,
  catalogProductHasPendingReport,
  setIsReportProductModalOpen,
  showCatalogProductManageFooter,
  handleAdminOpenEditProductFromDetails,
  isReportProductModalOpen,
  setCatalogProductHasPendingReport,
  isAuthorized,
  setIsLoginModalOpen,
  currentUserId,
  canModerateProducts,
}) {
  const handleCloseCatalogProductDetails = () => {
    setCatalogProductDetails(null);
    setCatalogProductDetailsTab("details");
    setProductDetailsAdminError("");
  };

  return (
    <>
      <SellerProductsLimitModal
        isOpen={isSellerProductsLimitModalOpen}
        onClose={() => setIsSellerProductsLimitModalOpen(false)}
        isPremiumUser={isPremiumUser}
        limit={sellerProductsLimit}
      />
      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        onSuccess={handleCreateProductSuccess}
        sellerLoyaltyPointsBalance={loyaltyPoints}
        sellerLoyaltyPointsReserved={loyaltyPointsReserved}
        sellerProducts={isMineMode ? products : []}
      />
      <CreateProductModal
        isOpen={productToEdit != null}
        onClose={handleCloseEditProductModal}
        onSuccess={handleEditProductSuccess}
        mode="edit"
        sellerLoyaltyPointsBalance={loyaltyPoints}
        sellerLoyaltyPointsReserved={loyaltyPointsReserved}
        sellerProducts={isMineMode ? products : []}
        productToEdit={productToEdit}
      />
      <ProductPromotionModal
        isOpen={promotionProduct != null}
        product={promotionProduct}
        tiers={promotionConfig.tiers}
        durations={promotionConfig.durations}
        loyaltyPoints={loyaltyPoints}
        errorMessage={promotionModalError}
        isSubmitting={isPromotionSubmitPending}
        onClose={handleClosePromotionModal}
        onSubmit={handleSubmitPromotionRequest}
        onDeleteProduct={handleDeleteMyProduct}
        onSetProductAvailability={handleSetMyProductAvailability}
        onSetProductAuction={handleSetProductAuction}
        isDeletePending={
          promotionProduct?._id != null &&
          deletingProductId === String(promotionProduct._id)
        }
        isAvailabilityTogglePending={
          promotionProduct?._id != null &&
          togglingAvailabilityProductId === String(promotionProduct._id)
        }
        isAuctionTogglePending={
          promotionProduct?._id != null &&
          togglingAuctionProductId === String(promotionProduct._id)
        }
        manageErrorMessage={myProductsCatalogError || productDetailsAdminError}
        canManageEdit={
          promotionProduct != null && (isAdmin || canSellerEditProduct(promotionProduct))
        }
        canManageDelete={
          promotionProduct != null && (isAdmin || canSellerDeleteProduct(promotionProduct))
        }
        canManageToggleVisibility={
          promotionProduct != null &&
          (isAdmin || canSellerToggleCatalogVisibility(promotionProduct))
        }
        sellerRaffleActive={sellerRaffleActive}
        onToggleRaffleParticipation={handleToggleRaffleParticipation}
        isRaffleParticipationPending={
          promotionProduct?._id != null &&
          raffleParticipationPendingProductId === String(promotionProduct._id)
        }
      />
      <CreateRaffleModal
        isOpen={raffleModal != null}
        mode={raffleModal?.mode ?? "create"}
        raffleToEdit={raffleModal?.mode === "edit" ? raffleModal.raffle : null}
        useStaffApi={raffleModal?.mode === "edit" ? raffleModal.useStaffApi : false}
        onClose={() => setRaffleModal(null)}
        onSuccess={() => {
          void refreshRaffleSurfaces();
          void refreshPendingRafflesCount();
          if (raffleModal?.mode === "create") {
            setMyProductsCatalogNotice("Розыгрыш отправлен на модерацию.");
          }
        }}
      />
      <ProductDetailsModal
        isOpen={catalogProductDetails != null}
        product={catalogProductDetails}
        onClose={handleCloseCatalogProductDetails}
        onSellerNameClick={handleSellerNameClick}
        isAuthorized={isAuthorized}
        onProductStatsUpdate={handleProductStatsUpdate}
        showAddToCart={catalogDetailsShowAddToCart}
        onRequestLogin={() => setIsLoginModalOpen(true)}
        currentUserId={currentUserId}
        initialDetailsTab={catalogProductDetailsTab}
        isPremiumUser={isPremiumUser}
        onProfileActionBadgesChanged={refreshUserProfileActionBadgeCounts}
        showStaffDetails={canModerateProducts && catalogProductDetails != null}
        secondaryFooter={
          canReportCatalogProduct ? (
            <button
              type="button"
              className="product-details-modal__footer-btn product-details-modal__footer-btn--report"
              disabled={catalogProductHasPendingReport}
              aria-label={
                catalogProductHasPendingReport
                  ? PRODUCT_REPORT_MODAL_UI.ALREADY_REPORTED
                  : PRODUCT_REPORT_MODAL_UI.REPORT_BUTTON
              }
              onClick={() => {
                if (!isAuthorized) {
                  setIsLoginModalOpen(true);
                  return;
                }
                setIsReportProductModalOpen(true);
              }}
            >
              <AppIcon icon={Flag} size="sm" strokeWidth={2.15} />
              {catalogProductHasPendingReport
                ? PRODUCT_REPORT_MODAL_UI.ALREADY_REPORTED
                : PRODUCT_REPORT_MODAL_UI.REPORT_BUTTON}
            </button>
          ) : null
        }
        adminFooter={
          showCatalogProductManageFooter && catalogProductDetails ? (
            <ProductDetailsAdminFooter
              onEdit={handleAdminOpenEditProductFromDetails}
              canEdit={isAdmin || canSellerEditProduct(catalogProductDetails)}
              isDeletePending={deletingProductId === String(catalogProductDetails._id)}
            />
          ) : null
        }
      />
      <ReportProductModal
        isOpen={isReportProductModalOpen}
        productId={
          catalogProductDetails?._id != null ? String(catalogProductDetails._id) : null
        }
        productName={catalogProductDetails?.productName ?? ""}
        hasPendingReport={catalogProductHasPendingReport}
        onClose={() => setIsReportProductModalOpen(false)}
        onSubmitted={() => {
          setCatalogProductHasPendingReport(true);
        }}
      />
    </>
  );
}
