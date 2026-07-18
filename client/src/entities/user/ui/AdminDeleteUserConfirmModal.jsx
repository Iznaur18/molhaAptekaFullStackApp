import { useEffect, useState } from "react";

import { useUserProfileMutations } from "../model/useUserProfileMutations.js";
import { ADMIN_EDIT_USER_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

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
 * Подтверждение удаления профиля вводом ника. Используется и админом (чужой
 * профиль), и владельцем (самоудаление) — тексты приходят через `copy`.
 *
 * @param {{
 *   isOpen: boolean;
 *   user: import('../model/types.js').UserPublicProfile | null;
 *   onClose: () => void;
 *   onDeleted: () => void;
 *   copy?: {
 *     DELETE_CONFIRM_TITLE: string;
 *     DELETE_CONFIRM_HINT: (token: string) => string;
 *     DELETE_CONFIRM_PLACEHOLDER: string;
 *     DELETE_SUBMIT: string;
 *     DELETE_CANCEL: string;
 *     DELETE_LOADING: string;
 *   };
 * }} props
 */
export function AdminDeleteUserConfirmModal({
  isOpen,
  user,
  onClose,
  onDeleted,
  copy = ADMIN_EDIT_USER_UI,
}) {
  const { deleteMutation } = useUserProfileMutations();
  const [confirmText, setConfirmText] = useState("");
  const [phase, setPhase] = useState(/** @type {'idle'|'loading'|'error'} */ ("idle"));
  const [error, setError] = useState("");

  const token = user ? deleteConfirmToken(user) : "";
  const canSubmit = Boolean(user) && token.length > 0 && confirmText.trim() === token;

  useScrollLock(isOpen);

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
      await deleteMutation.mutateAsync(String(user._id));
      onDeleted();
      onClose();
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : copy.DELETE_SUBMIT);
    }
  };

  return (
    <div className="admin-delete-user" role="presentation">
      <div className="admin-delete-user__backdrop" aria-hidden="true" />
      <div
        className="admin-delete-user__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-delete-user-title"
      >
        <h2 id="admin-delete-user-title" className="admin-delete-user__title">
          {copy.DELETE_CONFIRM_TITLE}
        </h2>
        <p className="admin-delete-user__hint">
          {copy.DELETE_CONFIRM_HINT(token)}
        </p>
        <form className="admin-delete-user__form" onSubmit={handleSubmit}>
          <input
            className="admin-delete-user__input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={copy.DELETE_CONFIRM_PLACEHOLDER}
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
              {copy.DELETE_CANCEL}
            </button>
            <button
              type="submit"
              className="admin-delete-user__btn admin-delete-user__btn_danger"
              disabled={!canSubmit || phase === "loading"}
            >
              {phase === "loading"
                ? copy.DELETE_LOADING
                : copy.DELETE_SUBMIT}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
