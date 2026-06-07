import { AdminDeleteUserConfirmModal } from "../../../entities/user/ui/AdminDeleteUserConfirmModal.jsx";
import { AdminUserModalFooter } from "../../../entities/user/ui/AdminUserModalFooter.jsx";
import { EditProfileModal } from "../../../entities/user/ui/EditProfileModal.jsx";
import { UserDetailsModal } from "../../../entities/user/ui/UserDetailsModal.jsx";
import { UserVoteRatingForm } from "../../../entities/user-vote-rating/ui/UserVoteRatingForm.jsx";
import { DataConfirmationRequestModal } from "../../../entities/user-data-confirmation/ui/DataConfirmationRequestModal.jsx";
import { canStaffEditTargetUserPremium } from "../../../entities/user/lib/canStaffEditTargetUserPremium.js";
import { ADMIN_EDIT_USER_UI } from "../../../shared/config/appUiCopy.js";

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
 *   refreshUsersList: () => void | Promise<void>;
 *   setSellerModal: import('react').Dispatch<import('react').SetStateAction<object>>;
 *   setIsLoginModalOpen: (open: boolean) => void;
 *   isDataConfirmationModalOpen: boolean;
 *   setIsDataConfirmationModalOpen: (open: boolean) => void;
 *   refreshDataConfirmationStatus: () => void | Promise<void>;
 *   refreshPendingDataConfirmationCount: () => void | Promise<void>;
 *   isEditProfileOpen: boolean;
 *   setIsEditProfileOpen: (open: boolean) => void;
 *   myProfilePage: { phase: string; user?: object | null };
 *   setMyProfilePage: import('react').Dispatch<import('react').SetStateAction<object>>;
 *   setIsPremiumUser: (value: boolean) => void;
 *   setLoyaltyPoints: (value: number) => void;
 *   isAdminEditUserOpen: boolean;
 *   isAdminDeleteUserOpen: boolean;
 *   setCatalogProductDetails: (product: ProductFromApi | null) => void;
 *   refreshCatalogFeed: () => void;
 *   setStaffActionNotice: (message: string) => void;
 *   goToSellerProducts: (userId: string) => void;
 * }} props
 */
export function AppShellUserModals({
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
  refreshUsersList,
  setSellerModal,
  setIsLoginModalOpen,
  isDataConfirmationModalOpen,
  setIsDataConfirmationModalOpen,
  refreshDataConfirmationStatus,
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
  refreshCatalogFeed,
  setStaffActionNotice,
  goToSellerProducts,
}) {
  const adminEditUser = sellerModal.phase === "success" ? sellerModal.user : null;
  const staffCanEditPremium =
    adminEditUser != null &&
    canStaffEditTargetUserPremium({
      editorRole: isAdmin ? "admin" : "moderator",
      targetRole: adminEditUser.userRole,
    });

  const renderVoteForm = (user) => (
    <UserVoteRatingForm
      key={String(user._id)}
      targetUser={user}
      currentUserId={currentUserId}
      isAuthorized={isAuthorized}
      onRequestLogin={() => setIsLoginModalOpen(true)}
      onVotePersisted={() => void refreshUsersList()}
      onRated={(snapshot) => {
        setSellerModal((prev) => {
          if (prev.phase !== "success" || !prev.user) return prev;
          return {
            ...prev,
            user: {
              ...prev.user,
              userRatingByVotes: snapshot.userRatingByVotes ?? prev.user.userRatingByVotes,
            },
          };
        });
      }}
    />
  );

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
                onDeleteClick={isAdmin ? () => setIsAdminDeleteUserOpen(true) : undefined}
              >
                {renderVoteForm(sellerModal.user)}
              </AdminUserModalFooter>
            ) : (
              renderVoteForm(sellerModal.user)
            )
          ) : null
        }
      />
      <DataConfirmationRequestModal
        isOpen={isDataConfirmationModalOpen}
        onClose={() => setIsDataConfirmationModalOpen(false)}
        onSubmitted={() => {
          void refreshDataConfirmationStatus();
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
          void refreshUsersList();
        }}
      />
      <AdminDeleteUserConfirmModal
        isOpen={isAdminDeleteUserOpen}
        user={sellerModal.phase === "success" ? sellerModal.user : null}
        onClose={() => setIsAdminDeleteUserOpen(false)}
        onDeleted={() => {
          closeSellerModal();
          setCatalogProductDetails(null);
          void refreshUsersList();
          void refreshCatalogFeed();
        }}
      />
    </>
  );
}
