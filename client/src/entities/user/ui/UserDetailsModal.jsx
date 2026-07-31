import { useEffect, useMemo, useState } from "react";

import { getUserProfileRows } from "../lib/getUserProfileRows.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "../lib/profileImageFocus.js";
import { resolveUserProfileBackgroundFromUser } from "../lib/userBackgroundValue.js";
import { pickUserProfilePhotoUrl } from "../lib/pickUserProfilePhotoUrl.js";
import { UserProfilePurchasesList } from "./UserProfilePurchasesList.jsx";
import { UserProfileProductsList } from "./UserProfileProductsList.jsx";
import { UserPremiumAvatar } from "./UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "./UserPremiumDisplayName.jsx";
import { UserProfileInfoPanel } from "./UserProfileInfoPanel.jsx";

import { USER_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./UserDetailsModal.css";

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {import('../model/types.js').UserPublicProfile | null} [props.user]
 * @param {boolean} [props.isLoading]
 * @param {string | null} [props.errorMessage]
 * @param {string} [props.titleOverride]
 * @param {import('react').ReactNode} [props.titleSlot]
 * @param {import('react').ReactNode} [props.titleAccessory]
 * @param {import('react').ReactNode} [props.footer]
 * @param {import('react').ReactNode} [props.notificationsSlot]
 * @param {'default'|'register'} [props.layoutVariant]
 * @param {boolean} [props.showAdminRole]
 * @param {string | null} [props.currentUserId]
 * @param {boolean} [props.isAuthorized]
 * @param {boolean} [props.viewerCanSeeOtherUserPurchases]
 * @param {(product: import('../../product/model/types.js').ProductFromApi) => void} [props.onPurchaseProductClick]
 * @param {() => void} [props.onViewAllSellerProducts]
 */
export function UserDetailsModal({
  isOpen,
  onClose,
  user,
  isLoading = false,
  errorMessage = null,
  titleOverride = "",
  titleSlot = null,
  titleAccessory = null,
  footer = null,
  notificationsSlot = null,
  layoutVariant = "default",
  showAdminRole = false,
  currentUserId = null,
  isAuthorized = false,
  viewerCanSeeOtherUserPurchases = false,
  onPurchaseProductClick,
  onViewAllSellerProducts,
}) {
  const photoUrl = user ? pickUserProfilePhotoUrl(user) : null;
  const avatarObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserAvatarFocus(user)),
    [user],
  );
  const backgroundObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserBackgroundFocus(user)),
    [user],
  );
  const profileBackground = user ? resolveUserProfileBackgroundFromUser(user) : null;
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);
  const isRegisterLayout = layoutVariant === "register";

  useEffect(() => {
    setAvatarLoadFailed(false);
    setBackgroundLoadFailed(false);
  }, [user?._id]);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPremiumUser = Boolean(user?.isPremiumUser);
  const isUserDataConfirmed = Boolean(user?.isUserDataConfirmed);

  const titleText = titleOverride
    ? titleOverride
    : isLoading
      ? USER_DETAILS_MODAL_UI.TITLE_LOADING
      : errorMessage
        ? USER_DETAILS_MODAL_UI.TITLE_FALLBACK
        : user?.userName?.trim()
          ? null
          : USER_DETAILS_MODAL_UI.TITLE_FALLBACK;

  const rows = user
    ? getUserProfileRows(user, { showAdminRole, hideMediaUrls: true })
    : [];

  const isOtherUserProfile =
    Boolean(user?._id) &&
    layoutVariant !== "register" &&
    (currentUserId == null || String(user._id) !== String(currentUserId));

  const showOtherUserProducts = isOtherUserProfile;
  const showOtherUserPurchases =
    isOtherUserProfile && isAuthorized && viewerCanSeeOtherUserPurchases;

  const canShowBackground =
    Boolean(profileBackground) &&
    (profileBackground.kind === "preset" ||
      (profileBackground.kind === "image" && !backgroundLoadFailed));
  const showProfileBanner =
    Boolean(user) && (canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed));

  const backdropClassName = [
    "user-details-modal__backdrop",
    isRegisterLayout ? "user-details-modal__backdrop_register" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const modalClassName = [
    "user-details-modal",
    isRegisterLayout ? "user-details-modal_register" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const closeClassName = [
    "user-details-modal__close",
    isRegisterLayout ? "user-details-modal__close_register" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={backdropClassName} role="presentation">
      <div
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-modal-title"
      >
        <header className="user-details-modal__header">
          <div className="user-details-modal__title-cluster">
            {titleSlot ? (
              titleSlot
            ) : (
              <h2 id="user-details-modal-title" className="user-details-modal__title">
                {titleText != null ? (
                  titleText
                ) : (
                  <UserPremiumDisplayName
                    name={String(user?.userName ?? "").trim()}
                    isPremium={isPremiumUser}
                    isUserDataConfirmed={isUserDataConfirmed}
                  />
                )}
              </h2>
            )}
            {titleAccessory}
          </div>
          <button
            type="button"
            className={closeClassName}
            onClick={onClose}
            aria-label={USER_DETAILS_MODAL_UI.ARIA_CLOSE}
          >
            {isRegisterLayout ? <ModalCloseIcon /> : USER_DETAILS_MODAL_UI.CLOSE_TEXT}
          </button>
        </header>
        <div className="user-details-modal__main">
          <div className="user-details-modal__scroll">
            {isLoading ? (
              <p className="user-details-modal__state">
                {USER_DETAILS_MODAL_UI.LOADING_BODY}
              </p>
            ) : null}
            {errorMessage && !isLoading ? (
              <p
                className="user-details-modal__state user-details-modal__state_error"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
            {!isLoading && !errorMessage && user ? (
              <div className="user-details-modal__profile-body">
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
                        isPremium={isPremiumUser}
                        objectPosition={avatarObjectPosition}
                        decoding="async"
                        onError={() => setAvatarLoadFailed(true)}
                      />
                    ) : null}
                  </div>
                ) : null}
                {showOtherUserProducts || showOtherUserPurchases ? (
                  <>
                    {showOtherUserPurchases ? (
                      <UserProfilePurchasesList
                        targetUserId={String(user._id)}
                        onProductClick={onPurchaseProductClick}
                      />
                    ) : null}
                    {showOtherUserProducts ? (
                      <UserProfileProductsList
                        targetUserId={String(user._id)}
                        onProductClick={onPurchaseProductClick}
                        onViewAllProducts={onViewAllSellerProducts}
                      />
                    ) : null}
                  </>
                ) : null}
                {notificationsSlot}
                <UserProfileInfoPanel
                  rows={rows}
                  hidePhoneUntilReveal={isOtherUserProfile}
                  userId={user?._id ? String(user._id) : null}
                />
              </div>
            ) : null}
          </div>
          {footer ? (
            <div className="user-details-modal__footer-outer">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
