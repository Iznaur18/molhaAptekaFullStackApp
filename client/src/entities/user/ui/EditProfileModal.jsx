import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { patchUserProfile } from "../api/patchUserProfile.js";
import { buildAdminPatchUserProfileBody } from "../lib/buildAdminPatchUserProfileBody.js";
import { buildPatchUserProfileBody } from "../lib/buildPatchUserProfileBody.js";
import { AddressDeliveryFields } from "../../address/ui/AddressDeliveryFields.jsx";
import { countWords } from "../lib/countWords.js";
import { mapUserToEditProfileForm } from "../lib/mapUserToEditProfileForm.js";
import { limitRuPhoneInput } from "../lib/ruPhone.js";
import { validateEditProfileForm } from "../lib/validateEditProfileForm.js";
import {
  PROFILE_FIELD_MAX_WORDS,
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
  COMMON_UI,
  EDIT_PROFILE_MODAL_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";

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
 * }} props
 */
export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSaved,
  adminMode = false,
}) {
  const [form, setForm] = useState(() => mapUserToEditProfileForm({ _id: "" }));
  const [feedback, setFeedback] = useState({ kind: "idle", message: "" });

  useEffect(() => {
    if (!isOpen || !user) return undefined;
    setForm(mapUserToEditProfileForm(user));
    setFeedback({ kind: "idle", message: "" });
    return undefined;
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const notesWords = useMemo(
    () => countWords(form.notesAboutUser),
    [form.notesAboutUser],
  );

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
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleClose = () => {
    setFeedback({ kind: "idle", message: "" });
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?._id) return;

    const clientError = validateEditProfileForm(form, {
      includeAdmin: adminMode,
    });
    if (clientError) {
      setFeedback({ kind: "error", message: clientError });
      return;
    }

    setFeedback({ kind: "loading", message: "" });

    try {
      const body = adminMode
        ? buildAdminPatchUserProfileBody(form)
        : buildPatchUserProfileBody(form);
      const updated = await patchUserProfile(String(user._id), body);
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
      <button
        type="button"
        className="edit-profile-modal__backdrop"
        aria-label={EDIT_PROFILE_MODAL_UI.ARIA_CLOSE_BACKDROP}
        onClick={handleClose}
      />
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
            {COMMON_UI.MODAL_CLOSE_GLYPH}
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
              <input
                className="edit-profile-modal__input"
                type="url"
                name="userAvatarUrl"
                value={form.userAvatarUrl}
                onChange={handleChange}
                placeholder={EDIT_PROFILE_MODAL_UI.PLACEHOLDER_HTTPS}
                autoComplete="off"
              />
            </label>
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_BG_URL}
              <input
                className="edit-profile-modal__input"
                type="url"
                name="userBackgroundUrl"
                value={form.userBackgroundUrl}
                onChange={handleChange}
                placeholder={EDIT_PROFILE_MODAL_UI.PLACEHOLDER_HTTPS}
                autoComplete="off"
              />
            </label>
            <label className="edit-profile-modal__label edit-profile-modal__label_row">
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={form.notificationsEnabled}
                onChange={handleChange}
              />
              {EDIT_PROFILE_MODAL_UI.LABEL_NOTIFICATIONS}
            </label>
            {adminMode ? (
              <fieldset className="edit-profile-modal__fieldset">
                <legend className="edit-profile-modal__legend">
                  {ADMIN_EDIT_USER_UI.SECTION_ADMIN}
                </legend>
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
                    className="edit-profile-modal__input"
                    type="number"
                    name="userDiscountPercent"
                    min={0}
                    max={100}
                    step={1}
                    value={form.userDiscountPercent}
                    onChange={handleChange}
                  />
                </label>
                <label className="edit-profile-modal__label edit-profile-modal__label_row">
                  <input
                    type="checkbox"
                    name="isPremiumUser"
                    checked={form.isPremiumUser}
                    onChange={handleChange}
                  />
                  {ADMIN_EDIT_USER_UI.LABEL_PREMIUM}
                </label>
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
              />
              <span
                className={
                  notesWords > PROFILE_FIELD_MAX_WORDS
                    ? "edit-profile-modal__word-meter edit-profile-modal__word-meter_overflow"
                    : "edit-profile-modal__word-meter"
                }
              >
                {EDIT_PROFILE_MODAL_UI.WORDS_USED(
                  notesWords,
                  PROFILE_FIELD_MAX_WORDS,
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
