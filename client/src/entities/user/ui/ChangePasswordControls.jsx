import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { changePassword } from "../api/passwordReset.js";
import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { PasswordInputField } from "../../../shared/ui/PasswordInputField/PasswordInputField.jsx";

/**
 * Смена пароля в профиле (только свой аккаунт).
 *
 * @param {{ disabled?: boolean }} props
 */
export function ChangePasswordControls({ disabled = false }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");

  const mutation = useMutation({
    mutationFn: changePassword,
  });

  const isBusy = disabled || mutation.isPending;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    setSuccess("");

    if (newPassword.length < EDIT_PROFILE_MODAL_UI.PASSWORD_MIN_LENGTH) {
      setLocalError(EDIT_PROFILE_MODAL_UI.PASSWORD_TOO_SHORT);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setLocalError(EDIT_PROFILE_MODAL_UI.PASSWORD_MISMATCH);
      return;
    }

    try {
      const data = await mutation.mutateAsync({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setSuccess(data?.message || EDIT_PROFILE_MODAL_UI.PASSWORD_CHANGE_SUCCESS);
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : EDIT_PROFILE_MODAL_UI.PASSWORD_CHANGE_ERROR,
      );
    }
  };

  return (
    <form className="edit-profile-modal__password-change" onSubmit={handleSubmit}>
      <p className="edit-profile-modal__hint">
        {EDIT_PROFILE_MODAL_UI.SECTION_PASSWORD}
      </p>
      <label className="edit-profile-modal__label">
        {EDIT_PROFILE_MODAL_UI.LABEL_CURRENT_PASSWORD}
        <PasswordInputField
          className="edit-profile-modal__input"
          name="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          minLength={EDIT_PROFILE_MODAL_UI.PASSWORD_MIN_LENGTH}
          autoComplete="current-password"
          disabled={isBusy}
          showPasswordAria={EDIT_PROFILE_MODAL_UI.SHOW_PASSWORD_ARIA}
          hidePasswordAria={EDIT_PROFILE_MODAL_UI.HIDE_PASSWORD_ARIA}
        />
      </label>
      <label className="edit-profile-modal__label">
        {EDIT_PROFILE_MODAL_UI.LABEL_NEW_PASSWORD}
        <PasswordInputField
          className="edit-profile-modal__input"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={EDIT_PROFILE_MODAL_UI.PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          disabled={isBusy}
          showPasswordAria={EDIT_PROFILE_MODAL_UI.SHOW_PASSWORD_ARIA}
          hidePasswordAria={EDIT_PROFILE_MODAL_UI.HIDE_PASSWORD_ARIA}
        />
      </label>
      <label className="edit-profile-modal__label">
        {EDIT_PROFILE_MODAL_UI.LABEL_NEW_PASSWORD_CONFIRM}
        <PasswordInputField
          className="edit-profile-modal__input"
          name="newPasswordConfirm"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          required
          minLength={EDIT_PROFILE_MODAL_UI.PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          disabled={isBusy}
          showPasswordAria={EDIT_PROFILE_MODAL_UI.SHOW_PASSWORD_ARIA}
          hidePasswordAria={EDIT_PROFILE_MODAL_UI.HIDE_PASSWORD_ARIA}
        />
      </label>
      {localError ? (
        <p className="edit-profile-modal__feedback edit-profile-modal__feedback--error" role="alert">
          {localError}
        </p>
      ) : null}
      {success ? (
        <p className="edit-profile-modal__feedback edit-profile-modal__feedback--ok" role="status">
          {success}
        </p>
      ) : null}
      <button
        type="submit"
        className="app-btn app-btn--secondary"
        disabled={isBusy}
      >
        {mutation.isPending
          ? EDIT_PROFILE_MODAL_UI.PASSWORD_CHANGE_LOADING
          : EDIT_PROFILE_MODAL_UI.PASSWORD_CHANGE_SUBMIT}
      </button>
    </form>
  );
}
