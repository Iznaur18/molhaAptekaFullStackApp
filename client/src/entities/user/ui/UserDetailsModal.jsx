import { useEffect, useState } from "react";

import { getUserProfileRows } from "../lib/getUserProfileRows.js";
import { resolveUserProfileBackgroundFromUser } from "../lib/userBackgroundValue.js";
import { pickUserProfilePhotoUrl } from "../lib/pickUserProfilePhotoUrl.js";
import { UserProfilePurchasesList } from "./UserProfilePurchasesList.jsx";
import { UserProfileProductsList } from "./UserProfileProductsList.jsx";
import { UserPremiumAvatar } from "./UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "./UserPremiumDisplayName.jsx";

import {
  COMMON_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";

import "./UserDetailsModal.css";

function isAbsoluteHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

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
}) {
  const photoUrl = user ? pickUserProfilePhotoUrl(user) : null;
  const profileBackground = user
    ? resolveUserProfileBackgroundFromUser(user)
    : null;
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);
  const isRegisterLayout = layoutVariant === "register";

  useEffect(() => {
    setAvatarLoadFailed(false);
    setBackgroundLoadFailed(false);
  }, [user?._id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
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

  const rows = user ? getUserProfileRows(user, { showAdminRole }) : [];

  const showOtherUserProfileLists =
    Boolean(user?._id) &&
    isAuthorized &&
    currentUserId != null &&
    String(user._id) !== String(currentUserId) &&
    layoutVariant !== "register";
  const showOtherUserPurchases =
    showOtherUserProfileLists && viewerCanSeeOtherUserPurchases;

  const canShowBackground =
    Boolean(profileBackground) &&
    (profileBackground.kind === "preset" ||
      (profileBackground.kind === "image" && !backgroundLoadFailed));
  const showProfileBanner =
    Boolean(user) &&
    (canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed));

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
    <div className={backdropClassName} role="presentation" onClick={onClose}>
      <div
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="user-details-modal__header">
          <div className="user-details-modal__title-cluster">
            {titleSlot ? (
              titleSlot
            ) : (
              <h2
                id="user-details-modal-title"
                className="user-details-modal__title"
              >
                {titleText != null ? (
                  titleText
                ) : (
                  <>
                    {USER_DETAILS_MODAL_UI.TITLE_WITH_NAME_PREFIX}
                    <UserPremiumDisplayName
                      name={String(user?.userName ?? "").trim()}
                      isPremium={isPremiumUser}
                      isUserDataConfirmed={isUserDataConfirmed}
                    />
                  </>
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
            {isRegisterLayout
              ? COMMON_UI.MODAL_CLOSE_GLYPH
              : USER_DETAILS_MODAL_UI.CLOSE_TEXT}
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
                        decoding="async"
                        onError={() => setAvatarLoadFailed(true)}
                      />
                    ) : null}
                  </div>
                ) : null}
                {showOtherUserProfileLists ? (
                  <>
                    {showOtherUserPurchases ? (
                      <UserProfilePurchasesList
                        targetUserId={String(user._id)}
                        onProductClick={onPurchaseProductClick}
                      />
                    ) : null}
                    <UserProfileProductsList
                      targetUserId={String(user._id)}
                      onProductClick={onPurchaseProductClick}
                    />
                  </>
                ) : null}
                {notificationsSlot}
                <dl className="user-details-modal__list">
                  {rows.map((row) => (
                    <div key={row.id} className="user-details-modal__row">
                      <dt className="user-details-modal__label">{row.label}</dt>
                      <dd className="user-details-modal__value">
                        {isAbsoluteHttpUrl(row.value) ? (
                          <a href={row.value} target="_blank" rel="noreferrer">
                            {row.value}
                          </a>
                        ) : (
                          row.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
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
