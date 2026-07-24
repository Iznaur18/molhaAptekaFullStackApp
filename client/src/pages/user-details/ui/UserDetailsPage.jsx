import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "../../../entities/user/lib/profileImageFocus.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import { resolveUserProfileBackgroundFromUser } from "../../../entities/user/lib/userBackgroundValue.js";
import { canStaffEditTargetUserPremium } from "../../../entities/user/lib/canStaffEditTargetUserPremium.js";
import { AdminDeleteUserConfirmModal } from "../../../entities/user/ui/AdminDeleteUserConfirmModal.jsx";
import { EditProfileModal } from "../../../entities/user/ui/EditProfileModal.jsx";
import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { UserProfileInfoPanel } from "../../../entities/user/ui/UserProfileInfoPanel.jsx";
import { UserProfileProductsList } from "../../../entities/user/ui/UserProfileProductsList.jsx";
import { UserProfilePurchasesList } from "../../../entities/user/ui/UserProfilePurchasesList.jsx";
import { UserFollowButton } from "../../../entities/user-follow/ui/UserFollowButton.jsx";
import { UserVoteRatingForm } from "../../../entities/user-vote-rating/ui/UserVoteRatingForm.jsx";
import {
  ADMIN_EDIT_USER_UI,
  USER_DETAILS_PAGE_UI,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import { useUserDetailsPage } from "../model/useUserDetailsPage.js";

import "../../../entities/user/ui/UserDetailsModal.css";
import "./UserDetailsPage.css";

function navigateBackOrHome(navigate) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate("/", { replace: true });
}

/**
 * Чужой профиль — паритет с mobile `/user/[id]`.
 */
export function UserDetailsPage() {
  const navigate = useNavigate();
  const {
    userId,
    user,
    profileQuery,
    profileRows,
    currentUserId,
    isAuthorized,
    isSelf,
    showOtherUserProducts,
    showOtherUserPurchases,
    canModerateProducts,
    isAdmin,
    handleFollowChange,
    handleRated,
    handleViewAllSellerProducts,
    handleProductClick,
    handleRequestLogin,
    refreshUsersList,
    refreshCatalogFeed,
    setStaffActionNotice,
  } = useUserDetailsPage();

  const [isAdminEditOpen, setIsAdminEditOpen] = useState(false);
  const [isAdminDeleteOpen, setIsAdminDeleteOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
    setBackgroundLoadFailed(false);
  }, [user?._id]);

  const photoUrl = user ? pickUserProfilePhotoUrl(user) : null;
  const avatarObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserAvatarFocus(user)),
    [user],
  );
  const backgroundObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserBackgroundFocus(user)),
    [user],
  );
  const profileBackground = user
    ? resolveUserProfileBackgroundFromUser(user)
    : null;

  const canShowBackground =
    Boolean(profileBackground) &&
    (profileBackground.kind === "preset" ||
      (profileBackground.kind === "image" && !backgroundLoadFailed));
  const showProfileBanner =
    Boolean(user) &&
    (canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed));

  const staffCanEditPremium =
    user != null &&
    canStaffEditTargetUserPremium({
      editorRole: isAdmin ? "admin" : "moderator",
      targetRole: user.userRole,
    });

  if (!userId) {
    return (
      <div className="user-details-page">
        <p className="user-details-page__state user-details-page__state_error" role="alert">
          {USER_DETAILS_PAGE_UI.FETCH_FALLBACK}
        </p>
      </div>
    );
  }

  if (isSelf) {
    return (
      <div className="user-details-page">
        <p className="user-details-page__state">{USER_DETAILS_PAGE_UI.SELF_REDIRECT_HINT}</p>
      </div>
    );
  }

  if (profileQuery.isPending) {
    return (
      <div className="user-details-page">
        <p className="user-details-page__state">{USER_DETAILS_PAGE_UI.LOADING}</p>
      </div>
    );
  }

  if (profileQuery.isError || !user) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : USER_DETAILS_PAGE_UI.FETCH_FALLBACK;
    return (
      <div className="user-details-page">
        <p className="user-details-page__state user-details-page__state_error" role="alert">
          {message}
        </p>
        <button
          type="button"
          className="app-btn app-btn--secondary user-details-page__retry"
          onClick={() => void profileQuery.refetch()}
        >
          {USER_DETAILS_PAGE_UI.RETRY}
        </button>
      </div>
    );
  }

  const displayName =
    String(user.userName ?? "").trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isFollowing = user.isFollowing === true;

  return (
    <div className="user-details-page">
      {/* Паритет mobile Stack.Screen title: "Профиль" */}
      <header className="user-details-page__nav">
        <button
          type="button"
          className="user-details-page__back"
          aria-label={USER_DETAILS_PAGE_UI.BACK_ARIA}
          onClick={() => navigateBackOrHome(navigate)}
        >
          <AppIcon icon={ChevronLeft} size="md" strokeWidth={2.25} />
        </button>
        <h1 className="user-details-page__nav-title">{USER_DETAILS_PAGE_UI.TITLE}</h1>
      </header>

      <div className="user-details-page__header">
        <div className="user-details-page__title-row">
          <p className="user-details-page__title">
            <UserPremiumDisplayName
              name={displayName}
              isPremium={user.isPremiumUser === true}
              isUserDataConfirmed={user.isUserDataConfirmed === true}
            />
          </p>
          <UserFollowButton
            targetUserId={userId}
            isFollowing={isFollowing}
            isAuthorized={isAuthorized}
            isSelf={false}
            onRequestLogin={handleRequestLogin}
            onFollowChange={handleFollowChange}
          />
        </div>
      </div>

      <div className="user-details-page__body">
        {showProfileBanner ? (
          <div
            className={
              canShowBackground
                ? "user-details-modal__banner user-details-modal__banner_has-bg"
                : "user-details-modal__banner"
            }
          >
            {canShowBackground && profileBackground?.kind === "image" ? (
              <img
                className="user-details-modal__banner-image"
                src={profileBackground.url}
                alt=""
                decoding="async"
                loading="lazy"
                referrerPolicy="no-referrer"
                style={{ objectPosition: backgroundObjectPosition }}
                onError={() => setBackgroundLoadFailed(true)}
              />
            ) : null}
            {canShowBackground && profileBackground?.kind === "preset" ? (
              <div
                className="user-details-modal__banner-color"
                style={{ backgroundColor: profileBackground.color }}
                aria-hidden="true"
              />
            ) : null}
            {photoUrl && !avatarLoadFailed ? (
              <UserPremiumAvatar
                className="user-details-modal__avatar user-details-modal__avatar_lead user-details-modal__avatar_on-banner"
                src={photoUrl}
                isPremium={user.isPremiumUser === true}
                objectPosition={avatarObjectPosition}
                decoding="async"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : null}
          </div>
        ) : null}

        {showOtherUserPurchases ? (
          <UserProfilePurchasesList
            targetUserId={userId}
            onProductClick={handleProductClick}
          />
        ) : null}

        {showOtherUserProducts ? (
          <UserProfileProductsList
            targetUserId={userId}
            onProductClick={handleProductClick}
            onViewAllProducts={handleViewAllSellerProducts}
          />
        ) : null}

        <UserProfileInfoPanel rows={profileRows} hidePhoneUntilReveal />

        {canModerateProducts ? (
          <div className="user-details-page__staff">
            <button
              type="button"
              className="app-btn app-btn--outline user-details-page__staff-btn"
              onClick={() => setIsAdminEditOpen(true)}
            >
              {ADMIN_EDIT_USER_UI.EDIT_BUTTON}
            </button>
            {isAdmin ? (
              <button
                type="button"
                className="app-btn app-btn--danger user-details-page__staff-btn"
                onClick={() => setIsAdminDeleteOpen(true)}
              >
                {ADMIN_EDIT_USER_UI.DELETE_BUTTON}
              </button>
            ) : null}
          </div>
        ) : null}

        <UserVoteRatingForm
          key={String(user._id)}
          targetUser={user}
          currentUserId={currentUserId}
          isAuthorized={isAuthorized}
          onRequestLogin={handleRequestLogin}
          onVotePersisted={() => void refreshUsersList?.()}
          onRated={handleRated}
        />
      </div>

      <EditProfileModal
        isOpen={isAdminEditOpen}
        onClose={() => setIsAdminEditOpen(false)}
        adminMode
        staffCanEditRole={isAdmin}
        staffCanEditPremium={staffCanEditPremium}
        user={user}
        onPremiumRevoked={() =>
          setStaffActionNotice?.(ADMIN_EDIT_USER_UI.PREMIUM_REVOKED_TOAST)
        }
        onSaved={(updatedUser) => {
          handleRated({ ...user, ...updatedUser });
          void refreshUsersList?.();
        }}
      />
      <AdminDeleteUserConfirmModal
        isOpen={isAdminDeleteOpen}
        user={user}
        onClose={() => setIsAdminDeleteOpen(false)}
        onDeleted={() => {
          void refreshUsersList?.();
          void refreshCatalogFeed?.();
          navigateBackOrHome(navigate);
        }}
      />
    </div>
  );
}
