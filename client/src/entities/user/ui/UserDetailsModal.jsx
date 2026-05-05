import { useEffect, useState } from "react";

import { getUserProfileRows } from "../lib/getUserProfileRows.js";
import { pickUserProfileBackgroundUrl } from "../lib/pickUserProfileBackgroundUrl.js";
import { pickUserProfilePhotoUrl } from "../lib/pickUserProfilePhotoUrl.js";

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
 * @param {'default'|'register'} [props.layoutVariant]
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
  layoutVariant = "default",
}) {
  const photoUrl = user ? pickUserProfilePhotoUrl(user) : null;
  const backgroundUrl = user ? pickUserProfileBackgroundUrl(user) : null;
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

  const title = titleOverride
    ? titleOverride
    : isLoading
      ? USER_DETAILS_MODAL_UI.TITLE_LOADING
      : errorMessage
        ? USER_DETAILS_MODAL_UI.TITLE_FALLBACK
        : user?.userName
          ? `${USER_DETAILS_MODAL_UI.TITLE_WITH_NAME_PREFIX}${user.userName}`
          : USER_DETAILS_MODAL_UI.TITLE_FALLBACK;

  const rows = user ? getUserProfileRows(user) : [];

  const canShowBackground = Boolean(backgroundUrl) && !backgroundLoadFailed;
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
                {title}
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
                    {canShowBackground ? (
                      <img
                        className="user-details-modal__banner-image"
                        src={backgroundUrl}
                        alt=""
                        decoding="async"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setBackgroundLoadFailed(true)}
                      />
                    ) : null}
                    {photoUrl && !avatarLoadFailed ? (
                      <img
                        className="user-details-modal__avatar user-details-modal__avatar_lead user-details-modal__avatar_on-banner"
                        src={photoUrl}
                        alt=""
                        decoding="async"
                        onError={() => setAvatarLoadFailed(true)}
                      />
                    ) : null}
                  </div>
                ) : null}
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
