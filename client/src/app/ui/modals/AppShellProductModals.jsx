import { CreateProductModal } from "../../../entities/product/ui/CreateProductModal.jsx";
import { ProductPromotionModal } from "../../../entities/product/ui/ProductPromotionModal.jsx";
import { SellerProductsLimitModal } from "../../../entities/product/ui/SellerProductsLimitModal.jsx";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
} from "../../../entities/product/lib/getProductModerationUi.js";

import { CreateRaffleModal } from "../../../entities/raffle/ui/CreateRaffleModal.jsx";

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
  productToCopy = null,
  setProductToCopy = () => {},
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
  handleSetProductQa,
  handleSetProductOriginality,
  handleSetProductOutOfStock,
  handleSetProductWholesale,
  handleSetProductBuyNFree,
  handleSetProductFlashSale,
  handleSetProductRental,
  handleSetProductAffiliate,
  handleSetProductLoyaltyPoints,
  handleWholesaleSaved,
  handleSetProductInstallment,
  handleInstallmentProgramSaved,
  deletingProductId,
  togglingAvailabilityProductId,
  togglingAuctionProductId,
  togglingQaProductId,
  togglingOriginalityProductId,
  togglingOutOfStockProductId,
  togglingWholesaleProductId,
  togglingBuyNFreeProductId,
  togglingFlashSaleProductId,
  togglingRentalProductId,
  togglingAffiliateProductId,
  togglingLoyaltyProductId,
  togglingInstallmentProductId,
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
}) {
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
        onClose={() => {
          setIsCreateProductModalOpen(false);
          setProductToCopy(null);
        }}
        onSuccess={handleCreateProductSuccess}
        sellerLoyaltyPointsBalance={loyaltyPoints}
        sellerLoyaltyPointsReserved={loyaltyPointsReserved}
        sellerProducts={isMineMode ? products : []}
        productToCopy={productToCopy}
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
        onSetProductAvailability={handleSetMyProductAvailability}
        onSetProductAuction={handleSetProductAuction}
        onSetProductQa={handleSetProductQa}
        onSetProductOriginality={handleSetProductOriginality}
        onSetProductOutOfStock={handleSetProductOutOfStock}
        onSetProductWholesale={handleSetProductWholesale}
        onSetProductBuyNFree={handleSetProductBuyNFree}
        onSetProductFlashSale={handleSetProductFlashSale}
        onSetProductRental={handleSetProductRental}
        onSetProductAffiliate={handleSetProductAffiliate}
        onSetProductLoyaltyPoints={handleSetProductLoyaltyPoints}
        onSetProductInstallment={handleSetProductInstallment}
        onWholesaleSaved={handleWholesaleSaved}
        onInstallmentProgramSaved={handleInstallmentProgramSaved}
        isAvailabilityTogglePending={
          promotionProduct?._id != null &&
          togglingAvailabilityProductId === String(promotionProduct._id)
        }
        isAuctionTogglePending={
          promotionProduct?._id != null &&
          togglingAuctionProductId === String(promotionProduct._id)
        }
        isQaTogglePending={
          promotionProduct?._id != null &&
          togglingQaProductId === String(promotionProduct._id)
        }
        isOriginalityTogglePending={
          promotionProduct?._id != null &&
          togglingOriginalityProductId === String(promotionProduct._id)
        }
        isOutOfStockTogglePending={
          promotionProduct?._id != null &&
          togglingOutOfStockProductId === String(promotionProduct._id)
        }
        isWholesaleTogglePending={
          promotionProduct?._id != null &&
          togglingWholesaleProductId === String(promotionProduct._id)
        }
        isBuyNFreeTogglePending={
          promotionProduct?._id != null &&
          togglingBuyNFreeProductId === String(promotionProduct._id)
        }
        isFlashSaleTogglePending={
          promotionProduct?._id != null &&
          togglingFlashSaleProductId === String(promotionProduct._id)
        }
        isRentalTogglePending={
          promotionProduct?._id != null &&
          togglingRentalProductId === String(promotionProduct._id)
        }
        isAffiliateTogglePending={
          promotionProduct?._id != null &&
          togglingAffiliateProductId === String(promotionProduct._id)
        }
        isLoyaltyTogglePending={
          promotionProduct?._id != null &&
          togglingLoyaltyProductId === String(promotionProduct._id)
        }
        isInstallmentTogglePending={
          promotionProduct?._id != null &&
          togglingInstallmentProductId === String(promotionProduct._id)
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
        onDeleteProduct={handleDeleteMyProduct}
        isDeletePending={
          promotionProduct?._id != null && deletingProductId === String(promotionProduct._id)
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
    </>
  );
}
