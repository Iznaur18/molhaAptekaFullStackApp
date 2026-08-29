import { createPortal } from "react-dom";
import { USER_FULL_NAME_MAX_LENGTH } from "@molha/api-contract";

import { useEditProfileModal } from "../model/useEditProfileModal.js";
import { UserSavedAddressesEditor } from "../../address/ui/UserSavedAddressesEditor.jsx";
import { RuRegionSelect } from "../../region/ui/RuRegionSelect.jsx";
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
import { INTEGER_INPUT_FIELD_PROPS } from "../../../shared/lib/numericInput.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";
import { ProfileImageFocusEditor } from "./ProfileImageFocusEditor.jsx";
import { DEFAULT_USER_BACKGROUND_FOCUS } from "../lib/profileImageFocus.js";
import { UserBackgroundPresetPicker } from "./UserBackgroundPresetPicker.jsx";
import { UserBackgroundPreview } from "./UserBackgroundPreview.jsx";
import { AdminPremiumStaffControl } from "./AdminPremiumStaffControl.jsx";
import { EditProfileSocialLinksFields } from "./EditProfileSocialLinksFields.jsx";
import { EditProfileBusinessHoursFields } from "./EditProfileBusinessHoursFields.jsx";
import { EmailBindControls } from "./EmailBindControls.jsx";
import { PhoneBindControls } from "./PhoneBindControls.jsx";
import { ChangePasswordControls } from "./ChangePasswordControls.jsx";

import "./EditProfileModal.css";

const GENDER_OPTIONS = [USER_GENDER_MALE, USER_GENDER_FEMALE, USER_GENDER_NO_SELECTED];
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
  allowStaffLoyaltyEdit = false,
  onPremiumRevoked,
}) {
  const {
    form,
    setForm,
    feedback,
    notesChars,
    backgroundMode,
    avatarFocusImageUrl,
    backgroundFocusImageUrl,
    isSubmitting,
    baselineEmail,
    baselinePhone,
    contactVerified,
    handleChange,
    handleEmailVerified,
    handlePhoneVerified,
    handleClose,
    handleSubmit,
    setAddressEditorOpen,
  } = useEditProfileModal({
    isOpen,
    onClose,
    user,
    onSaved,
    adminMode,
    staffCanEditRole,
    staffCanEditPremium,
    allowStaffLoyaltyEdit,
    onPremiumRevoked,
  });

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
              {adminMode ? (
                <input
                  className="edit-profile-modal__input edit-profile-modal__input_readonly"
                  type="text"
                  readOnly
                  value={user.email ?? ""}
                  autoComplete="email"
                />
              ) : (
                <>
                  <input
                    className="edit-profile-modal__input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                  <EmailBindControls
                    email={form.email}
                    isEmailVerified={user?.isEmailVerified === true || contactVerified.email}
                    baselineEmail={baselineEmail}
                    disabled={isSubmitting}
                    onVerified={handleEmailVerified}
                  />
                </>
              )}
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
                placeholder="user.name"
                autoComplete="username"
              />
              <span className="edit-profile-modal__hint">
                {EDIT_PROFILE_MODAL_UI.USERNAME_HINT}
              </span>
            </label>
            <div className="edit-profile-modal__subsection">
              <h3 className="edit-profile-modal__subsection-title">
                {EDIT_PROFILE_MODAL_UI.SECTION_BUSINESS_HOURS}
              </h3>
              <EditProfileBusinessHoursFields
                enabled={form.userBusinessHoursEnabled}
                weekdays={form.userBusinessHoursWeekdays}
                openTime={form.userBusinessHoursOpenTime}
                closeTime={form.userBusinessHoursCloseTime}
                disabled={isSubmitting}
                onEnabledChange={(userBusinessHoursEnabled) =>
                  setForm((prev) => ({ ...prev, userBusinessHoursEnabled }))
                }
                onWeekdaysChange={(userBusinessHoursWeekdays) =>
                  setForm((prev) => ({ ...prev, userBusinessHoursWeekdays }))
                }
                onOpenTimeChange={(userBusinessHoursOpenTime) =>
                  setForm((prev) => ({ ...prev, userBusinessHoursOpenTime }))
                }
                onCloseTimeChange={(userBusinessHoursCloseTime) =>
                  setForm((prev) => ({ ...prev, userBusinessHoursCloseTime }))
                }
              />
            </div>
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_FULL_NAME}
              <input
                className="edit-profile-modal__input"
                type="text"
                name="userFullName"
                value={form.userFullName}
                onChange={handleChange}
                maxLength={USER_FULL_NAME_MAX_LENGTH}
                autoComplete="name"
                placeholder="Иван Иванов"
                disabled={isSubmitting}
              />
              <span className="edit-profile-modal__hint">
                {EDIT_PROFILE_MODAL_UI.HINT_FULL_NAME}
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
                placeholder="8 (912) 345-67-89"
              />
              {!adminMode ? (
                <PhoneBindControls
                  phoneNumber={form.userPhoneNumber}
                  isPhoneVerified={user?.isPhoneVerified === true || contactVerified.phone}
                  baselinePhone={baselinePhone}
                  disabled={isSubmitting}
                  onVerified={handlePhoneVerified}
                />
              ) : null}
            </label>
            {!adminMode ? <ChangePasswordControls disabled={isSubmitting} /> : null}
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
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_REGION}
              <RuRegionSelect
                className="edit-profile-modal__input"
                value={form.userRegionCode}
                disabled={isSubmitting}
                required
                onChange={(userRegionCode) =>
                  setForm((prev) => ({ ...prev, userRegionCode }))
                }
              />
              <span className="edit-profile-modal__hint">
                {EDIT_PROFILE_MODAL_UI.HINT_REGION}
              </span>
            </label>
            <UserSavedAddressesEditor
              value={form.savedAddresses}
              onChange={(savedAddresses) =>
                setForm((prev) => {
                  const defaultAddress =
                    savedAddresses.find((item) => item.isDefault) ?? null;
                  return {
                    ...prev,
                    savedAddresses,
                    ...(defaultAddress?.regionCode
                      ? { userRegionCode: defaultAddress.regionCode }
                      : {}),
                  };
                })
              }
              disabled={isSubmitting}
              lineInputClassName="edit-profile-modal__input"
              onEditingChange={setAddressEditorOpen}
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
                      setForm((prev) => ({
                        ...prev,
                        backgroundImageUrl,
                        userBackgroundFocus:
                          backgroundImageUrl.trim() !== prev.backgroundImageUrl.trim()
                            ? DEFAULT_USER_BACKGROUND_FOCUS
                            : prev.userBackgroundFocus,
                      }))
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
                  <AdminPremiumStaffControl
                    user={user}
                    premiumExpiresAt={form.premiumExpiresAt}
                    onPremiumExpiresAtChange={(premiumExpiresAt) =>
                      setForm((prev) => ({ ...prev, premiumExpiresAt }))
                    }
                    disabled={isSubmitting}
                  />
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
            <EditProfileSocialLinksFields
              form={form}
              onChange={handleChange}
              onClear={(fieldId) =>
                setForm((prev) => ({ ...prev, [fieldId]: "" }))
              }
              disabled={isSubmitting}
            />
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
