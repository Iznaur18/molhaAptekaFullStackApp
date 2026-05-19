import { useEffect, useState } from "react";

import { deleteUserProfile } from "../api/deleteUserProfile.js";
import { ADMIN_EDIT_USER_UI } from "../../../shared/config/appUiCopy.js";

import "./AdminDeleteUserConfirmModal.css";

/**
 * @param {import('../model/types.js').UserPublicProfile} user
 * @returns {string}
 */
function deleteConfirmToken(user) {
  const name = user.userName?.trim();
  if (name) return name;
  return user.email?.trim() || "";
}

/**
 * @param {{
 *   isOpen: boolean;
 *   user: import('../model/types.js').UserPublicProfile | null;
 *   onClose: () => void;
 *   onDeleted: () => void;
 * }} props
 */
export function AdminDeleteUserConfirmModal({
  isOpen,
  user,
  onClose,
  onDeleted,
}) {
  const [confirmText, setConfirmText] = useState("");
  const [phase, setPhase] = useState(/** @type {'idle'|'loading'|'error'} */ ("idle"));
  const [error, setError] = useState("");

  const token = user ? deleteConfirmToken(user) : "";
  const canSubmit =
    Boolean(user) && token.length > 0 && confirmText.trim() === token;

  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
      setPhase("idle");
      setError("");
    }
  }, [isOpen, user?._id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || phase === "loading") return;

    setPhase("loading");
    setError("");

    try {
      await deleteUserProfile(String(user._id));
      onDeleted();
      onClose();
    } catch (e) {
      setPhase("error");
      setError(
        e instanceof Error ? e.message : ADMIN_EDIT_USER_UI.DELETE_SUBMIT,
      );
    }
  };

  return (
    <div className="admin-delete-user" role="presentation">
      <button
        type="button"
        className="admin-delete-user__backdrop"
        aria-label={ADMIN_EDIT_USER_UI.DELETE_CANCEL}
        onClick={onClose}
      />
      <div
        className="admin-delete-user__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-delete-user-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-delete-user-title" className="admin-delete-user__title">
          {ADMIN_EDIT_USER_UI.DELETE_CONFIRM_TITLE}
        </h2>
        <p className="admin-delete-user__hint">
          {ADMIN_EDIT_USER_UI.DELETE_CONFIRM_HINT(token)}
        </p>
        <form className="admin-delete-user__form" onSubmit={handleSubmit}>
          <input
            className="admin-delete-user__input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={ADMIN_EDIT_USER_UI.DELETE_CONFIRM_PLACEHOLDER}
            autoComplete="off"
            disabled={phase === "loading"}
          />
          {error ? (
            <p className="admin-delete-user__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="admin-delete-user__actions">
            <button
              type="button"
              className="admin-delete-user__btn admin-delete-user__btn_secondary"
              onClick={onClose}
              disabled={phase === "loading"}
            >
              {ADMIN_EDIT_USER_UI.DELETE_CANCEL}
            </button>
            <button
              type="submit"
              className="admin-delete-user__btn admin-delete-user__btn_danger"
              disabled={!canSubmit || phase === "loading"}
            >
              {phase === "loading"
                ? ADMIN_EDIT_USER_UI.DELETE_LOADING
                : ADMIN_EDIT_USER_UI.DELETE_SUBMIT}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
