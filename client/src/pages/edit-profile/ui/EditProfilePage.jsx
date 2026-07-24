import { useEditProfileModal } from "../../../entities/user/model/useEditProfileModal.js";
import { AddressStructuredFields } from "../../../entities/address/ui/AddressStructuredFields.jsx";
import {
  NOTES_ABOUT_USER_MAX_CHARS,
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_LABEL_RU,
  USER_GENDER_NO_SELECTED,
  USER_NAME_MAX_LENGTH,
} from "../../../entities/user/model/userConstants.js";
import { ADMIN_EDIT_USER_UI, EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { INTEGER_INPUT_FIELD_PROPS } from "../../../shared/lib/numericInput.js";
import { ProfileAvatarUpload } from "../../../entities/user/ui/ProfileAvatarUpload.jsx";
import { ProfileBackgroundUpload } from "../../../entities/user/ui/ProfileBackgroundUpload.jsx";
import { EditProfileSocialLinksFields } from "../../../entities/user/ui/EditProfileSocialLinksFields.jsx";

import "../../../entities/user/ui/EditProfileModal.css";
import "./EditProfilePage.css";

const GENDER_OPTIONS = [USER_GENDER_MALE, USER_GENDER_FEMALE, USER_GENDER_NO_SELECTED];

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
      />
    </svg>
  );
}

/**
 * @param {string} title
 * @param {import('react').ReactNode} children
 */
function FormSection({ title, children }) {
  return (
    <section className="edit-profile-page__section">
      <header className="edit-profile-page__section-header">
        <span className="edit-profile-page__section-accent" aria-hidden="true" />
        <h2 className="edit-profile-page__section-title">{title}</h2>
      </header>
      <div className="edit-profile-page__card">{children}</div>
    </section>
  );
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   user: import('../../../entities/user/model/types.js').UserPublicProfile | null;
 *   onSaved: (user: import('../../../entities/user/model/types.js').UserPublicProfile) => void;
 *   onCancel: () => void;
 *   allowStaffLoyaltyEdit?: boolean;
 * }} props
 */
export function EditProfilePage({
  isAuthorized,
  onRequestLogin,
  user,
  onSaved,
  onCancel,
  allowStaffLoyaltyEdit = false,
}) {
  const {
    form,
    setForm,
    feedback,
    notesChars,
    backgroundMode,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useEditProfileModal({
    isOpen: Boolean(user),
    onClose: onCancel,
    user,
    onSaved,
    allowStaffLoyaltyEdit,
    variant: "page",
  });

  if (!isAuthorized) {
    return (
      <section className="edit-profile-page edit-profile-page_centered">
        <p className="edit-profile-page__hint">{EDIT_PROFILE_MODAL_UI.AUTH_REQUIRED}</p>
        <button type="button" className="edit-profile-page__login" onClick={onRequestLogin}>
          {EDIT_PROFILE_MODAL_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="edit-profile-page edit-profile-page_centered">
        <p className="edit-profile-page__hint">Загрузка профиля…</p>
      </section>
    );
  }

  return (
    <section className="edit-profile-page">
      <div className="edit-profile-page__hero">
        <div className="edit-profile-page__hero-text">
          <h1 className="edit-profile-page__hero-title">{EDIT_PROFILE_MODAL_UI.TITLE}</h1>
          <p className="edit-profile-page__hero-intro">{EDIT_PROFILE_MODAL_UI.HERO_INTRO}</p>
        </div>
        <div className="edit-profile-page__hero-icon" aria-hidden="true">
          <PencilIcon />
        </div>
      </div>

      <form className="edit-profile-page__form" onSubmit={handleSubmit}>
        <div className="edit-profile-page__sections">
          <FormSection title={EDIT_PROFILE_MODAL_UI.SECTION_APPEARANCE}>
            <div className="edit-profile-page__media">
              <ProfileAvatarUpload
                avatarUrl={form.userAvatarUrl}
                avatarFocus={form.userAvatarFocus}
                disabled={isSubmitting}
                onAvatarUrlChange={(userAvatarUrl) =>
                  setForm((prev) => ({ ...prev, userAvatarUrl }))
                }
                onAvatarFocusChange={(userAvatarFocus) =>
                  setForm((prev) => ({ ...prev, userAvatarFocus }))
                }
              />
              <ProfileBackgroundUpload
                mode={backgroundMode}
                presetId={form.backgroundPresetId}
                imageUrl={form.backgroundImageUrl}
                focus={form.userBackgroundFocus}
                disabled={isSubmitting}
                onPresetChange={(backgroundPresetId) =>
                  setForm((prev) => ({ ...prev, backgroundPresetId }))
                }
                onImageUrlChange={(backgroundImageUrl) =>
                  setForm((prev) => ({ ...prev, backgroundImageUrl }))
                }
                onFocusChange={(userBackgroundFocus) =>
                  setForm((prev) => ({ ...prev, userBackgroundFocus }))
                }
              />
            </div>
          </FormSection>

          <FormSection title={EDIT_PROFILE_MODAL_UI.SECTION_ACCOUNT}>
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
              <span className="edit-profile-modal__hint">{EDIT_PROFILE_MODAL_UI.USERNAME_HINT}</span>
            </label>
            {allowStaffLoyaltyEdit ? (
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
          </FormSection>

          <FormSection title={EDIT_PROFILE_MODAL_UI.SECTION_PERSONAL}>
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
            <AddressStructuredFields
              value={form.structuredAddress}
              onChange={(structuredAddress) =>
                setForm((prev) => ({ ...prev, structuredAddress }))
              }
              disabled={isSubmitting}
              inputClassName="edit-profile-modal__input"
            />
          </FormSection>

          <FormSection title={EDIT_PROFILE_MODAL_UI.SECTION_NOTIFICATIONS}>
            <label className="edit-profile-modal__label edit-profile-modal__label_row">
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={form.notificationsEnabled}
                onChange={handleChange}
              />
              {EDIT_PROFILE_MODAL_UI.LABEL_NOTIFICATIONS}
            </label>
          </FormSection>

          <FormSection title={EDIT_PROFILE_MODAL_UI.SECTION_ABOUT}>
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
                {EDIT_PROFILE_MODAL_UI.CHARS_USED(notesChars, NOTES_ABOUT_USER_MAX_CHARS)}
              </span>
            </label>
          </FormSection>

          <FormSection title={EDIT_PROFILE_MODAL_UI.SECTION_SOCIAL}>
            <EditProfileSocialLinksFields
              form={form}
              onChange={handleChange}
              onClear={(fieldId) => setForm((prev) => ({ ...prev, [fieldId]: "" }))}
              disabled={isSubmitting}
              hideLegend
            />
          </FormSection>
        </div>

        <div className="edit-profile-page__footer">
          <div className="edit-profile-page__feedback">
            {feedback.kind === "error" ? (
              <p className="edit-profile-page__message edit-profile-page__message_error" role="alert">
                {feedback.message}
              </p>
            ) : null}
            {feedback.kind === "success" ? (
              <p className="edit-profile-page__message edit-profile-page__message_success" role="status">
                {feedback.message}
              </p>
            ) : null}
          </div>
          <div className="edit-profile-page__actions">
            <button
              type="button"
              className="edit-profile-page__cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {EDIT_PROFILE_MODAL_UI.CANCEL}
            </button>
            <button type="submit" className="edit-profile-page__submit" disabled={isSubmitting}>
              {isSubmitting
                ? EDIT_PROFILE_MODAL_UI.SUBMIT_LOADING
                : EDIT_PROFILE_MODAL_UI.SUBMIT_IDLE}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
