import { AdminDeleteUserConfirmModal } from "../../../entities/user/ui/AdminDeleteUserConfirmModal.jsx";
import { AdminUserModalFooter } from "../../../entities/user/ui/AdminUserModalFooter.jsx";
import { EditProfileModal } from "../../../entities/user/ui/EditProfileModal.jsx";
import { LoginModal } from "../../../entities/user/ui/LoginModal.jsx";
import { RegisterModal } from "../../../entities/user/ui/RegisterModal.jsx";
import { UserDetailsModal } from "../../../entities/user/ui/UserDetailsModal.jsx";
import { UserVoteRatingForm } from "../../../entities/user-vote-rating/ui/UserVoteRatingForm.jsx";
import { UserFollowButton } from "../../../entities/user-follow/ui/UserFollowButton.jsx";
import { DataConfirmationRequestModal } from "../../../entities/user-data-confirmation/ui/DataConfirmationRequestModal.jsx";
import { CreateProductModal } from "../../../entities/product/ui/CreateProductModal.jsx";
import { SellerProductsLimitModal } from "../../../entities/product/ui/SellerProductsLimitModal.jsx";
import { ProductDetailsAdminFooter } from "../../../entities/product/ui/ProductDetailsAdminFooter.jsx";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import { ProductPromotionModal } from "../../../entities/product/ui/ProductPromotionModal.jsx";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
} from "../../../entities/product/lib/getProductModerationUi.js";
import { CreateRaffleModal } from "../../../entities/raffle/ui/CreateRaffleModal.jsx";
import { ReportProductModal } from "../../../entities/product-report/ui/ReportProductModal.jsx";
import { EditProductCatalogFeedTileDisplayModal } from "../../../entities/product-category-display/ui/EditProductCatalogFeedTileDisplayModal.jsx";
import { EditProductCategoryDisplayModal } from "../../../entities/product-category-display/ui/EditProductCategoryDisplayModal.jsx";
import {
  ADMIN_EDIT_USER_UI,
  PRODUCT_REPORT_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { canStaffEditTargetUserPremium } from "../../../entities/user/lib/canStaffEditTargetUserPremium.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {{
 *   sellerModal: { open: boolean; phase: string; user?: object | null; error?: string };
 *   closeSellerModal: () => void;
 *   renderSellerFollowAccessory: () => import('react').ReactNode;
 *   currentUserId: string | null;
 *   isAuthorized: boolean;
 *   isPremiumUser: boolean;
 *   canModerateProducts: boolean;
 *   isAdmin: boolean;
 *   setIsAdminEditUserOpen: (open: boolean) => void;
 *   setIsAdminDeleteUserOpen: (open: boolean) => void;
 *   setUsersListTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   setSellerModal: import('react').Dispatch<import('react').SetStateAction<object>>;
 *   setIsLoginModalOpen: (open: boolean) => void;
 *   isDataConfirmationModalOpen: boolean;
 *   setIsDataConfirmationModalOpen: (open: boolean) => void;
 *   setDataConfirmationStatusRefreshTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   refreshPendingDataConfirmationCount: () => void | Promise<void>;
 *   isEditProfileOpen: boolean;
 *   setIsEditProfileOpen: (open: boolean) => void;
 *   myProfilePage: { phase: string; user?: object | null };
 *   setMyProfilePage: import('react').Dispatch<import('react').SetStateAction<object>>;
 *   setIsPremiumUser: (value: boolean) => void;
 *   setLoyaltyPoints: (value: number) => void;
 *   isAdminEditUserOpen: boolean;
 *   isAdminDeleteUserOpen: boolean;
 *   closeSellerModalAndCleanup: () => void;
 *   setCatalogProductDetails: (product: ProductFromApi | null) => void;
 *   setCatalogRefreshTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   setProducts: import('react').Dispatch<import('react').SetStateAction<ProductFromApi[]>>;
 *   isLoginModalOpen: boolean;
 *   setIsAuthorized: (value: boolean) => void;
 *   isRegisterModalOpen: boolean;
 *   setIsRegisterModalOpen: (open: boolean) => void;
 *   isSellerProductsLimitModalOpen: boolean;
 *   setIsSellerProductsLimitModalOpen: (open: boolean) => void;
 *   sellerProductsLimit: number | null;
 *   isCreateProductModalOpen: boolean;
 *   setIsCreateProductModalOpen: (open: boolean) => void;
 *   handleCreateProductSuccess: () => void;
 *   loyaltyPoints: number;
 *   loyaltyPointsReserved: number;
 *   isMineMode: boolean;
 *   products: ProductFromApi[];
 *   productToEdit: ProductFromApi | null;
 *   handleCloseEditProductModal: () => void;
 *   handleEditProductSuccess: () => void;
 *   handleDeleteMyProduct: (productId: string) => void;
 *   handleSetMyProductAvailability: (productId: string, available: boolean) => void;
 *   handleSetProductAuction: (productId: string, isAuction: boolean) => void;
 *   deletingProductId: string | null;
 *   togglingAvailabilityProductId: string | null;
 *   togglingAuctionProductId: string | null;
 *   myProductsCatalogError: string;
 *   productDetailsAdminError: string;
 *   sellerRaffleActive: boolean;
 *   handleToggleRaffleParticipation: (productId: string, participate: boolean) => void;
 *   raffleParticipationPendingProductId: string | null;
 *   promotionProduct: ProductFromApi | null;
 *   promotionConfig: { tiers: Array<{ tier: number; title: string; description: string }>; durations: Array<{ code: string; title: string; durationHours: number; durationMult: number }> };
 *   promotionModalError: string;
 *   isPromotionSubmitPending: boolean;
 *   handleClosePromotionModal: () => void;
 *   handleSubmitPromotionRequest: (tariffCode: string) => void;
 *   raffleModal: object | null;
 *   setRaffleModal: import('react').Dispatch<import('react').SetStateAction<object | null>>;
 *   setRaffleRefreshTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   refreshFeaturedRaffle: () => void | Promise<void>;
 *   refreshSellerRaffleState: () => void | Promise<void>;
 *   refreshPendingRafflesCount: () => void | Promise<void>;
 *   setMyProductsCatalogNotice: (message: string) => void;
 *   setStaffActionNotice: (message: string) => void;
 *   catalogProductDetails: ProductFromApi | null;
 *   setCatalogProductDetailsTab: (tab: string) => void;
 *   setProductDetailsAdminError: (message: string) => void;
 *   handleSellerNameClick: (userId: string) => void;
 *   goToSellerProducts: (userId: string) => void;
 *   handleProductStatsUpdate: (product: ProductFromApi) => void;
 *   catalogDetailsShowAddToCart: boolean;
 *   catalogProductDetailsTab: string;
 *   refreshUserProfileActionBadgeCounts: () => void | Promise<void>;
 *   canReportCatalogProduct: boolean;
 *   catalogProductHasPendingReport: boolean;
 *   setIsReportProductModalOpen: (open: boolean) => void;
 *   showCatalogProductManageFooter: boolean;
 *   handleAdminOpenEditProductFromDetails: () => void;
 *   isReportProductModalOpen: boolean;
 *   setCatalogProductHasPendingReport: (value: boolean) => void;
 *   editingCategorySlug: string | null;
 *   setEditingCategorySlug: (slug: string | null) => void;
 *   categoryDisplays: import('../../../entities/product-category-display/model/types.js').ProductCategoryDisplayFromApi[];
 *   handleCategoryDisplaySaved: () => void;
 *   editingFeedTileKey: string | null;
 *   setEditingFeedTileKey: (tileKey: string | null) => void;
 *   feedTileDisplays: import('../../../entities/product-category-display/model/types.js').ProductCatalogFeedTileDisplayFromApi[];
 *   handleFeedTileDisplaySaved: (display: import('../../../entities/product-category-display/model/types.js').ProductCatalogFeedTileDisplayFromApi) => void;
 * }} props
 */
export function HomePageModalsLayer({
  sellerModal,
  closeSellerModal,
  renderSellerFollowAccessory,
  currentUserId,
  isAuthorized,
  isPremiumUser,
  canModerateProducts,
  isAdmin,
  setIsAdminEditUserOpen,
  setIsAdminDeleteUserOpen,
  setUsersListTick,
  setSellerModal,
  setIsLoginModalOpen,
  isDataConfirmationModalOpen,
  setIsDataConfirmationModalOpen,
  setDataConfirmationStatusRefreshTick,
  refreshPendingDataConfirmationCount,
  isEditProfileOpen,
  setIsEditProfileOpen,
  myProfilePage,
  setMyProfilePage,
  setIsPremiumUser,
  setLoyaltyPoints,
  isAdminEditUserOpen,
  isAdminDeleteUserOpen,
  setCatalogProductDetails,
  setCatalogRefreshTick,
  setProducts,
  isLoginModalOpen,
  setIsAuthorized,
  isRegisterModalOpen,
  setIsRegisterModalOpen,
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
  promotionProduct,
  promotionConfig,
  promotionModalError,
  isPromotionSubmitPending,
  handleClosePromotionModal,
  handleSubmitPromotionRequest,
  raffleModal,
  setRaffleModal,
  setRaffleRefreshTick,
  refreshFeaturedRaffle,
  refreshSellerRaffleState,
  refreshPendingRafflesCount,
  setMyProductsCatalogNotice,
  setStaffActionNotice,
  catalogProductDetails,
  setCatalogProductDetailsTab,
  setProductDetailsAdminError,
  handleSellerNameClick,
  goToSellerProducts,
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
  editingCategorySlug,
  setEditingCategorySlug,
  categoryDisplays,
  handleCategoryDisplaySaved,
  editingFeedTileKey,
  setEditingFeedTileKey,
  feedTileDisplays,
  handleFeedTileDisplaySaved,
}) {
  const adminEditUser = sellerModal.phase === "success" ? sellerModal.user : null;
  const staffCanEditPremium =
    adminEditUser != null &&
    canStaffEditTargetUserPremium({
      editorRole: isAdmin ? "admin" : "moderator",
      targetRole: adminEditUser.userRole,
    });

  return (
    <>
      <UserDetailsModal
        isOpen={sellerModal.open}
        onClose={closeSellerModal}
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        isLoading={sellerModal.phase === "loading"}
        errorMessage={sellerModal.phase === "error" ? sellerModal.error : null}
        titleAccessory={renderSellerFollowAccessory()}
        currentUserId={currentUserId}
        isAuthorized={isAuthorized}
        viewerCanSeeOtherUserPurchases={isPremiumUser || canModerateProducts}
        onPurchaseProductClick={(product) => setCatalogProductDetails(product)}
        onViewAllSellerProducts={
          sellerModal.phase === "success" && sellerModal.user?._id != null
            ? () => goToSellerProducts(String(sellerModal.user._id))
            : undefined
        }
        footer={
          sellerModal.phase === "success" && sellerModal.user ? (
            canModerateProducts ? (
              <AdminUserModalFooter
                onEditClick={() => setIsAdminEditUserOpen(true)}
                onDeleteClick={
                  isAdmin ? () => setIsAdminDeleteUserOpen(true) : undefined
                }
              >
                <UserVoteRatingForm
                  key={String(sellerModal.user._id)}
                  targetUser={sellerModal.user}
                  currentUserId={currentUserId}
                  isAuthorized={isAuthorized}
                  onRequestLogin={() => setIsLoginModalOpen(true)}
                  onVotePersisted={() => setUsersListTick((n) => n + 1)}
                  onRated={(snapshot) => {
                    setSellerModal((prev) => {
                      if (prev.phase !== "success" || !prev.user) return prev;
                      return {
                        ...prev,
                        user: {
                          ...prev.user,
                          userRatingByVotes:
                            snapshot.userRatingByVotes ?? prev.user.userRatingByVotes,
                        },
                      };
                    });
                  }}
                />
              </AdminUserModalFooter>
            ) : (
              <UserVoteRatingForm
                key={String(sellerModal.user._id)}
                targetUser={sellerModal.user}
                currentUserId={currentUserId}
                isAuthorized={isAuthorized}
                onRequestLogin={() => setIsLoginModalOpen(true)}
                onVotePersisted={() => setUsersListTick((n) => n + 1)}
                onRated={(snapshot) => {
                  setSellerModal((prev) => {
                    if (prev.phase !== "success" || !prev.user) return prev;
                    return {
                      ...prev,
                      user: {
                        ...prev.user,
                        userRatingByVotes:
                          snapshot.userRatingByVotes ?? prev.user.userRatingByVotes,
                      },
                    };
                  });
                }}
              />
            )
          ) : null
        }
      />
      <DataConfirmationRequestModal
        isOpen={isDataConfirmationModalOpen}
        onClose={() => setIsDataConfirmationModalOpen(false)}
        onSubmitted={() => {
          setDataConfirmationStatusRefreshTick((tick) => tick + 1);
          void refreshPendingDataConfirmationCount();
        }}
      />
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        allowStaffLoyaltyEdit={canModerateProducts}
        user={myProfilePage.phase === "success" ? myProfilePage.user : null}
        onPremiumRevoked={() =>
          setStaffActionNotice(ADMIN_EDIT_USER_UI.PREMIUM_REVOKED_TOAST)
        }
        onSaved={(updatedUser) => {
          setMyProfilePage((prev) =>
            prev.phase === "success" && prev.user
              ? { ...prev, user: { ...prev.user, ...updatedUser } }
              : prev,
          );
          if (updatedUser.isPremiumUser !== undefined) {
            setIsPremiumUser(Boolean(updatedUser.isPremiumUser));
          }
          if (updatedUser.userLoyaltyPoints != null) {
            setLoyaltyPoints(Number(updatedUser.userLoyaltyPoints) || 0);
          }
        }}
      />
      <EditProfileModal
        isOpen={isAdminEditUserOpen}
        onClose={() => setIsAdminEditUserOpen(false)}
        adminMode
        staffCanEditRole={isAdmin}
        staffCanEditPremium={staffCanEditPremium}
        user={adminEditUser}
        onPremiumRevoked={() =>
          setStaffActionNotice(ADMIN_EDIT_USER_UI.PREMIUM_REVOKED_TOAST)
        }
        onSaved={(updatedUser) => {
          setSellerModal((prev) =>
            prev.open && prev.phase === "success" && prev.user
              ? { ...prev, user: { ...prev.user, ...updatedUser } }
              : prev,
          );
          setUsersListTick((n) => n + 1);
        }}
      />
      <AdminDeleteUserConfirmModal
        isOpen={isAdminDeleteUserOpen}
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        onClose={() => setIsAdminDeleteUserOpen(false)}
        onDeleted={() => {
          const deletedSellerId =
            sellerModal.phase === "success" && sellerModal.user?._id != null
              ? String(sellerModal.user._id)
              : null;
          closeSellerModal();
          setCatalogProductDetails(null);
          setUsersListTick((n) => n + 1);
          setCatalogRefreshTick((n) => n + 1);
          if (deletedSellerId) {
            setProducts((prev) =>
              prev.filter((product) => {
                const seller = product.productSeller;
                if (seller == null) {
                  return true;
                }
                if (typeof seller === "string") {
                  return seller !== deletedSellerId;
                }
                if (typeof seller === "object" && seller._id != null) {
                  return String(seller._id) !== deletedSellerId;
                }
                return true;
              }),
            );
          }
        }}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsAuthorized(true);
          setIsLoginModalOpen(false);
        }}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setIsAuthorized(true);
          setIsRegisterModalOpen(false);
        }}
      />
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
        manageProduct={productToEdit}
        onDeleteProduct={handleDeleteMyProduct}
        onSetProductAvailability={handleSetMyProductAvailability}
        onSetProductAuction={handleSetProductAuction}
        isDeletePending={
          productToEdit?._id != null && deletingProductId === String(productToEdit._id)
        }
        isAvailabilityTogglePending={
          productToEdit?._id != null &&
          togglingAvailabilityProductId === String(productToEdit._id)
        }
        isAuctionTogglePending={
          productToEdit?._id != null &&
          togglingAuctionProductId === String(productToEdit._id)
        }
        manageErrorMessage={myProductsCatalogError || productDetailsAdminError}
        canManageEdit={
          productToEdit != null && (isAdmin || canSellerEditProduct(productToEdit))
        }
        canManageDelete={
          productToEdit != null && (isAdmin || canSellerDeleteProduct(productToEdit))
        }
        canManageToggleVisibility={
          productToEdit != null &&
          (isAdmin || canSellerToggleCatalogVisibility(productToEdit))
        }
        sellerRaffleActive={sellerRaffleActive}
        onToggleRaffleParticipation={handleToggleRaffleParticipation}
        isRaffleParticipationPending={
          productToEdit?._id != null &&
          raffleParticipationPendingProductId === String(productToEdit._id)
        }
      />
      <ProductPromotionModal
        isOpen={promotionProduct != null}
        productName={promotionProduct?.productName ?? ""}
        productPrice={Number(promotionProduct?.productPrice) || 0}
        tiers={promotionConfig.tiers}
        durations={promotionConfig.durations}
        loyaltyPoints={loyaltyPoints}
        errorMessage={promotionModalError}
        isSubmitting={isPromotionSubmitPending}
        onClose={handleClosePromotionModal}
        onSubmit={handleSubmitPromotionRequest}
      />
      <CreateRaffleModal
        isOpen={raffleModal != null}
        mode={raffleModal?.mode ?? "create"}
        raffleToEdit={raffleModal?.mode === "edit" ? raffleModal.raffle : null}
        useStaffApi={raffleModal?.mode === "edit" ? raffleModal.useStaffApi : false}
        onClose={() => setRaffleModal(null)}
        onSuccess={() => {
          setRaffleRefreshTick((n) => n + 1);
          void refreshFeaturedRaffle();
          void refreshSellerRaffleState();
          void refreshPendingRafflesCount();
          if (raffleModal?.mode === "create") {
            setMyProductsCatalogNotice("Розыгрыш отправлен на модерацию.");
          }
        }}
      />
      <ProductDetailsModal
        isOpen={catalogProductDetails != null}
        product={catalogProductDetails}
        onClose={() => {
          setCatalogProductDetails(null);
          setCatalogProductDetailsTab("details");
          setProductDetailsAdminError("");
        }}
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
              className="product-details-modal__report-btn"
              disabled={catalogProductHasPendingReport}
              onClick={() => {
                if (!isAuthorized) {
                  setIsLoginModalOpen(true);
                  return;
                }
                setIsReportProductModalOpen(true);
              }}
            >
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
      <EditProductCategoryDisplayModal
        isOpen={editingCategorySlug != null}
        categorySlug={editingCategorySlug}
        displays={categoryDisplays}
        onClose={() => setEditingCategorySlug(null)}
        onSaved={handleCategoryDisplaySaved}
      />
      <EditProductCatalogFeedTileDisplayModal
        isOpen={editingFeedTileKey != null}
        tileKey={editingFeedTileKey}
        displays={feedTileDisplays}
        onClose={() => setEditingFeedTileKey(null)}
        onSaved={handleFeedTileDisplaySaved}
      />
    </>
  );
}
