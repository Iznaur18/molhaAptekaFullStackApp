import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { patchUserProfile } from "../api/patchUserProfile.js";
import { buildAdminPatchUserProfileBody } from "../lib/buildAdminPatchUserProfileBody.js";
import { buildPatchUserProfileBody } from "../lib/buildPatchUserProfileBody.js";
import { willFormDisablePremium } from "../lib/willFormDisablePremium.js";
import { AddressDeliveryFields } from "../../address/ui/AddressDeliveryFields.jsx";
import { mapUserToEditProfileForm } from "../lib/mapUserToEditProfileForm.js";
import { limitRuPhoneInput } from "../lib/ruPhone.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { validateEditProfileForm } from "../lib/validateEditProfileForm.js";
import {
  NOTES_ABOUT_USER_MAX_CHARS,
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_LABEL_RU,
  USER_GENDER_NO_SELECTED,
  USER_NAME_MAX_LENGTH,
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  USER_ROLE_USER,
  USER_ROLE_LABEL_RU,
} from "../model/userConstants.js";
import {
  ADMIN_EDIT_USER_UI,
  EDIT_PROFILE_MODAL_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { isHttpProfileImageUrl } from "../lib/profileImageFocus.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";
import { ProfileImageFocusEditor } from "./ProfileImageFocusEditor.jsx";
import { UserBackgroundPresetPicker } from "./UserBackgroundPresetPicker.jsx";
import { UserBackgroundPreview } from "./UserBackgroundPreview.jsx";

import "./EditProfileModal.css";

const GENDER_OPTIONS = [
  USER_GENDER_MALE,
  USER_GENDER_FEMALE,
  USER_GENDER_NO_SELECTED,
];

const ROLE_OPTIONS = [USER_ROLE_USER, USER_ROLE_MODERATOR, USER_ROLE_ADMIN];

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   user: import('../model/types.js').UserPublicProfile | null;
 *   onSaved: (user: import('../model/types.js').UserPublicProfile) => void;
 *   adminMode?: boolean;
 *   staffCanEditRole?: boolean;
 *   staffCanEditPremium?: boolean;
 *   allowSelfPremiumToggle?: boolean;
 *   allowStaffLoyaltyEdit?: boolean;
 *   onPremiumRevoked?: () => void;
 * }} props
 */
export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSaved,
  adminMode = false,
  staffCanEditRole = false,
  staffCanEditPremium = false,
  allowSelfPremiumToggle = false,
  allowStaffLoyaltyEdit = false,
  onPremiumRevoked,
}) {
  const [form, setForm] = useState(() => mapUserToEditProfileForm({ _id: "" }));
  const [feedback, setFeedback] = useState({ kind: "idle", message: "" });
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const didOpen = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!didOpen || !user) {
      return undefined;
    }

    setForm(mapUserToEditProfileForm(user));
    setFeedback({ kind: "idle", message: "" });
    return undefined;
  }, [isOpen, user]);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const notesChars = useMemo(
    () => String(form.notesAboutUser ?? "").length,
    [form.notesAboutUser],
  );

  const isPremiumUser = (() => {
    const raw = String(form.premiumExpiresAt ?? "").trim();
    if (!raw) {
      return false;
    }
    const expiresAt = new Date(raw).getTime();
    return Number.isFinite(expiresAt) && expiresAt > Date.now();
  })();
  const backgroundMode =
    adminMode || allowSelfPremiumToggle
      ? "admin"
      : isPremiumUser
        ? "image"
        : "preset";

  const avatarFocusImageUrl = useMemo(() => {
    const url = resolveImageUrlForDisplay(form.userAvatarUrl ?? "");
    return isHttpProfileImageUrl(url) ? url : "";
  }, [form.userAvatarUrl]);

  const backgroundFocusImageUrl = useMemo(() => {
    const url = resolveImageUrlForDisplay(form.backgroundImageUrl ?? "");
    if (!isHttpProfileImageUrl(url)) return "";
    if (backgroundMode === "image" || backgroundMode === "admin") return url;
    return "";
  }, [backgroundMode, form.backgroundImageUrl]);

  const isSubmitting = feedback.kind === "loading";

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    let nextValue = type === "checkbox" ? checked : value;
    if (name === "userName" && typeof nextValue === "string") {
      nextValue = nextValue.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    if (name === "userPhoneNumber" && typeof nextValue === "string") {
      nextValue = limitRuPhoneInput(nextValue);
    }
    if (
      (name === "userLoyaltyPoints" || name === "userDiscountPercent") &&
      typeof nextValue === "string"
    ) {
      nextValue = keepDigitsOnly(nextValue);
    }
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleClose = () => {
    setFeedback({ kind: "idle", message: "" });
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?._id) return;

    const canEditLoyaltyPoints = adminMode || allowStaffLoyaltyEdit;
    const clientError = validateEditProfileForm(form, {
      includeAdmin: adminMode,
      includeLoyaltyPoints: canEditLoyaltyPoints,
      backgroundMode,
    });
    if (clientError) {
      setFeedback({ kind: "error", message: clientError });
      return;
    }

    const premiumWillBeDisabled =
      ((adminMode && staffCanEditPremium) || allowSelfPremiumToggle) &&
      willFormDisablePremium(user, form);
    if (premiumWillBeDisabled) {
      const userName = String(user.userName ?? "").trim() || "пользователя";
      if (!window.confirm(ADMIN_EDIT_USER_UI.DISABLE_PREMIUM_CONFIRM(userName))) {
        return;
      }
    }

    setFeedback({ kind: "loading", message: "" });

    try {
      const profilePatchOptions = {
        initialPhoneNumber: user.userPhoneNumber,
      };
      const body = adminMode
        ? buildAdminPatchUserProfileBody(form, {
            ...profilePatchOptions,
            includePremium: staffCanEditPremium,
          })
        : buildPatchUserProfileBody(form, {
            backgroundMode,
            includePremium: allowSelfPremiumToggle,
            includeLoyaltyPoints: allowStaffLoyaltyEdit,
            ...profilePatchOptions,
          });
      const updated = await patchUserProfile(String(user._id), body);
      if (premiumWillBeDisabled) {
        onPremiumRevoked?.();
      }
      handleClose();
      onSaved(updated);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : EDIT_PROFILE_MODAL_UI.SUBMIT_IDLE;
      setFeedback({ kind: "error", message });
    }
  };

  if (!isOpen || !user) return null;

  return createPortal(
    <div
      className="edit-profile-modal"
      role="dialog"
      aria-modal="true"
      aria-label={
        adminMode ? ADMIN_EDIT_USER_UI.TITLE : EDIT_PROFILE_MODAL_UI.ARIA_DIALOG
      }
    >
      <div className="edit-profile-modal__backdrop" aria-hidden="true" />
      <div className="edit-profile-modal__card">
        <div className="edit-profile-modal__header">
          <h2 className="edit-profile-modal__title">
            {adminMode ? ADMIN_EDIT_USER_UI.TITLE : EDIT_PROFILE_MODAL_UI.TITLE}
          </h2>
          <button
            type="button"
            className="edit-profile-modal__close"
            onClick={handleClose}
            aria-label={USER_DETAILS_MODAL_UI.ARIA_CLOSE}
          >
            <ModalCloseIcon />
          </button>
        </div>
        <form className="edit-profile-modal__body" onSubmit={handleSubmit}>
          <div className="edit-profile-modal__scroll">
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_EMAIL}
              <input
                className="edit-profile-modal__input edit-profile-modal__input_readonly"
                type="text"
                readOnly
                value={user.email ?? ""}
                autoComplete="email"
              />
            </label>
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_USERNAME}
              <input
                className="edit-profile-modal__input"
                type="text"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                maxLength={USER_NAME_MAX_LENGTH}
                title={EDIT_PROFILE_MODAL_UI.USERNAME_HINT}
                placeholder="nickname123"
                autoComplete="username"
              />
              <span className="edit-profile-modal__hint">
                {EDIT_PROFILE_MODAL_UI.USERNAME_HINT}
              </span>
            </label>
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_PHONE}
              <input
                className="edit-profile-modal__input"
                type="tel"
                name="userPhoneNumber"
                value={form.userPhoneNumber}
                onChange={handleChange}
                autoComplete="tel"
                inputMode="tel"
              />
            </label>
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_BIRTH}
              <input
                className="edit-profile-modal__input"
                type="date"
                name="userBirthDate"
                value={form.userBirthDate}
                onChange={handleChange}
              />
            </label>
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_GENDER}
              <select
                className="edit-profile-modal__input"
                name="userGender"
                value={form.userGender}
                onChange={handleChange}
              >
                {GENDER_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {USER_GENDER_LABEL_RU[value]}
                  </option>
                ))}
              </select>
            </label>
            <AddressDeliveryFields
              value={form.deliveryAddress}
              onChange={(deliveryAddress) =>
                setForm((prev) => ({ ...prev, deliveryAddress }))
              }
              disabled={isSubmitting}
              lineInputClassName="edit-profile-modal__input"
              flatInputClassName="edit-profile-modal__input"
              labels={{ line: EDIT_PROFILE_MODAL_UI.LABEL_ADDRESS }}
            />
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_AVATAR_URL}
              <ImageUrlField
                name="userAvatarUrl"
                value={form.userAvatarUrl}
                onChange={(userAvatarUrl) =>
                  setForm((prev) => ({ ...prev, userAvatarUrl }))
                }
                disabled={isSubmitting}
                inputClassName="edit-profile-modal__input"
                placeholder={EDIT_PROFILE_MODAL_UI.PLACEHOLDER_HTTPS}
              />
            </label>
            {avatarFocusImageUrl ? (
              <ProfileImageFocusEditor
                imageUrl={avatarFocusImageUrl}
                variant="avatar"
                value={form.userAvatarFocus}
                onChange={(userAvatarFocus) =>
                  setForm((prev) => ({ ...prev, userAvatarFocus }))
                }
                disabled={isSubmitting}
              />
            ) : null}
            {backgroundMode === "preset" ? (
              <>
                <div className="edit-profile-modal__background-block">
                  <p className="edit-profile-modal__background-label">
                    {EDIT_PROFILE_MODAL_UI.LABEL_BG_PREVIEW}
                  </p>
                  <UserBackgroundPreview
                    presetId={form.backgroundPresetId}
                    imageUrl=""
                    mode="preset"
                  />
                </div>
                <UserBackgroundPresetPicker
                  value={form.backgroundPresetId}
                  onChange={(presetId) =>
                    setForm((prev) => ({ ...prev, backgroundPresetId: presetId }))
                  }
                  disabled={isSubmitting}
                  legend={EDIT_PROFILE_MODAL_UI.LABEL_BG_PRESET}
                />
              </>
            ) : null}
            {backgroundMode === "image" || backgroundMode === "admin" ? (
              <>
                <label className="edit-profile-modal__label">
                  {backgroundMode === "admin"
                    ? EDIT_PROFILE_MODAL_UI.LABEL_BG_URL_ADMIN
                    : EDIT_PROFILE_MODAL_UI.LABEL_BG_URL}
                  <ImageUrlField
                    name="backgroundImageUrl"
                    value={form.backgroundImageUrl}
                    onChange={(backgroundImageUrl) =>
                      setForm((prev) => ({ ...prev, backgroundImageUrl }))
                    }
                    disabled={isSubmitting}
                    inputClassName="edit-profile-modal__input"
                    placeholder={EDIT_PROFILE_MODAL_UI.PLACEHOLDER_HTTPS}
                  />
                </label>
                {backgroundFocusImageUrl ? (
                  <ProfileImageFocusEditor
                    imageUrl={backgroundFocusImageUrl}
                    variant="background"
                    value={form.userBackgroundFocus}
                    onChange={(userBackgroundFocus) =>
                      setForm((prev) => ({ ...prev, userBackgroundFocus }))
                    }
                    disabled={isSubmitting}
                  />
                ) : backgroundMode === "admin" ? (
                  <div className="edit-profile-modal__background-block">
                    <p className="edit-profile-modal__background-label">
                      {EDIT_PROFILE_MODAL_UI.LABEL_BG_PREVIEW}
                    </p>
                    <UserBackgroundPreview
                      presetId={form.backgroundPresetId}
                      imageUrl=""
                      mode="preset"
                    />
                  </div>
                ) : null}
                {backgroundMode === "admin" ? (
                  <UserBackgroundPresetPicker
                    value={form.backgroundPresetId}
                    onChange={(presetId) =>
                      setForm((prev) => ({ ...prev, backgroundPresetId: presetId }))
                    }
                    disabled={isSubmitting}
                    legend={EDIT_PROFILE_MODAL_UI.LABEL_BG_PRESET}
                  />
                ) : null}
              </>
            ) : null}
            <label className="edit-profile-modal__label edit-profile-modal__label_row">
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={form.notificationsEnabled}
                onChange={handleChange}
              />
              {EDIT_PROFILE_MODAL_UI.LABEL_NOTIFICATIONS}
            </label>
            {allowSelfPremiumToggle ? (
              <label className="edit-profile-modal__label">
                {ADMIN_EDIT_USER_UI.LABEL_PREMIUM_EXPIRES_AT}
                <input
                  type="datetime-local"
                  className="edit-profile-modal__input"
                  name="premiumExpiresAt"
                  value={form.premiumExpiresAt}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <span className="edit-profile-modal__hint">
                  {ADMIN_EDIT_USER_UI.LABEL_PREMIUM_EXPIRES_HINT}
                </span>
              </label>
            ) : null}
            {adminMode || allowStaffLoyaltyEdit ? (
              <label className="edit-profile-modal__label">
                {ADMIN_EDIT_USER_UI.LABEL_LOYALTY_POINTS}
                <input
                  {...INTEGER_INPUT_FIELD_PROPS}
                  className="edit-profile-modal__input"
                  name="userLoyaltyPoints"
                  value={form.userLoyaltyPoints}
                  onChange={handleChange}
                />
              </label>
            ) : null}
            {adminMode ? (
              <fieldset className="edit-profile-modal__fieldset">
                <legend className="edit-profile-modal__legend">
                  {ADMIN_EDIT_USER_UI.SECTION_ADMIN}
                </legend>
                {staffCanEditRole ? (
                  <>
                    <label className="edit-profile-modal__label">
                      {ADMIN_EDIT_USER_UI.LABEL_ROLE}
                      <select
                        className="edit-profile-modal__input"
                        name="userRole"
                        value={form.userRole}
                        onChange={handleChange}
                      >
                        {ROLE_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {USER_ROLE_LABEL_RU[value]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="edit-profile-modal__label">
                      {ADMIN_EDIT_USER_UI.LABEL_DISCOUNT}
                      <input
                        {...INTEGER_INPUT_FIELD_PROPS}
                        className="edit-profile-modal__input"
                        name="userDiscountPercent"
                        maxLength={3}
                        value={form.userDiscountPercent}
                        onChange={handleChange}
                      />
                    </label>
                  </>
                ) : null}
                <label className="edit-profile-modal__label edit-profile-modal__label_row">
                  <input
                    type="checkbox"
                    name="isUserDataConfirmed"
                    checked={form.isUserDataConfirmed}
                    onChange={handleChange}
                  />
                  {ADMIN_EDIT_USER_UI.LABEL_USER_DATA_CONFIRMED}
                </label>
                {staffCanEditPremium ? (
                  <label className="edit-profile-modal__label">
                    {ADMIN_EDIT_USER_UI.LABEL_PREMIUM_EXPIRES_AT}
                    <input
                      type="datetime-local"
                      className="edit-profile-modal__input"
                      name="premiumExpiresAt"
                      value={form.premiumExpiresAt}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <span className="edit-profile-modal__hint">
                      {ADMIN_EDIT_USER_UI.LABEL_PREMIUM_EXPIRES_HINT}
                    </span>
                  </label>
                ) : null}
                <label className="edit-profile-modal__label edit-profile-modal__label_row">
                  <input
                    type="checkbox"
                    name="isActiveUser"
                    checked={form.isActiveUser}
                    onChange={handleChange}
                  />
                  {ADMIN_EDIT_USER_UI.LABEL_ACCOUNT_ACTIVE}
                </label>
                <label className="edit-profile-modal__label edit-profile-modal__label_row">
                  <input
                    type="checkbox"
                    name="isBlockedUser"
                    checked={form.isBlockedUser}
                    onChange={handleChange}
                  />
                  {ADMIN_EDIT_USER_UI.LABEL_BLOCKED}
                </label>
              </fieldset>
            ) : null}
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_NOTES}
              <textarea
                className="edit-profile-modal__textarea"
                name="notesAboutUser"
                value={form.notesAboutUser}
                onChange={handleChange}
                rows={3}
                maxLength={NOTES_ABOUT_USER_MAX_CHARS}
              />
              <span
                className={
                  notesChars > NOTES_ABOUT_USER_MAX_CHARS
                    ? "edit-profile-modal__word-meter edit-profile-modal__word-meter_overflow"
                    : "edit-profile-modal__word-meter"
                }
              >
                {EDIT_PROFILE_MODAL_UI.CHARS_USED(
                  notesChars,
                  NOTES_ABOUT_USER_MAX_CHARS,
                )}
              </span>
            </label>
          </div>
          <div className="edit-profile-modal__footer">
            <div className="edit-profile-modal__feedback">
              {feedback.kind === "error" ? (
                <p
                  className="edit-profile-modal__message edit-profile-modal__message_error"
                  role="alert"
                >
                  {feedback.message}
                </p>
              ) : null}
            </div>
            <div className="edit-profile-modal__actions">
              <button
                type="button"
                className="edit-profile-modal__cancel"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {EDIT_PROFILE_MODAL_UI.CANCEL}
              </button>
              <button
                type="submit"
                className="edit-profile-modal__submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? EDIT_PROFILE_MODAL_UI.SUBMIT_LOADING
                  : EDIT_PROFILE_MODAL_UI.SUBMIT_IDLE}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
