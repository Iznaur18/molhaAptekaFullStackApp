import { useEffect, useMemo, useState } from "react";

import { createRaffle } from "../api/createRaffle.js";
import { patchMyRaffle } from "../api/patchMyRaffle.js";
import { patchRaffleByStaff } from "../api/patchRaffleByStaff.js";
import { isHttpProfileImageUrl } from "../../user/lib/profileImageFocus.js";
import { ProfileImageFocusEditor } from "../../user/ui/ProfileImageFocusEditor.jsx";
import {
  DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS,
  getRafflePrizeImageFocus,
} from "../lib/rafflePrizeImageFocus.js";
import {
  API_CLIENT_UI,
  CREATE_RAFFLE_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

import "./CreateRaffleModal.css";

const INITIAL_FORM = {
  title: "",
  description: "",
  prizeImageUrl: "",
  prizeImageFocus: { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS },
  targetSales: "",
  instagramUrl: "",
};

/**
 * @param {import('../model/types.js').RaffleFromApi} raffle
 */
function formFromRaffle(raffle) {
  return {
    title: raffle.title ?? "",
    description: raffle.description ?? "",
    prizeImageUrl: raffle.prizeImageUrl ?? "",
    prizeImageFocus: getRafflePrizeImageFocus(raffle),
    targetSales: String(raffle.targetSales ?? ""),
    instagramUrl: raffle.instagramUrl ?? "",
  };
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: () => void;
 *   mode?: 'create' | 'edit';
 *   raffleToEdit?: import('../model/types.js').RaffleFromApi | null;
 *   useStaffApi?: boolean;
 * }} props
 */
export function CreateRaffleModal({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  raffleToEdit = null,
  useStaffApi = false,
}) {
  const isEdit = mode === "edit" && raffleToEdit != null;
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  useEffect(() => {
    if (!isOpen) return;
    setForm(isEdit ? formFromRaffle(raffleToEdit) : INITIAL_FORM);
    setStatus({ kind: "idle", message: "" });
  }, [isOpen, isEdit, raffleToEdit]);

  const prizeFocusImageUrl = useMemo(() => {
    const url = String(form.prizeImageUrl ?? "").trim();
    return isHttpProfileImageUrl(url) ? url : "";
  }, [form.prizeImageUrl]);

  if (!isOpen) return null;

  const isSubmitting = status.kind === "loading";
  const modalTitle = isEdit
    ? CREATE_RAFFLE_MODAL_UI.TITLE_EDIT
    : CREATE_RAFFLE_MODAL_UI.TITLE;
  const ariaDialog = isEdit
    ? CREATE_RAFFLE_MODAL_UI.ARIA_DIALOG_EDIT
    : CREATE_RAFFLE_MODAL_UI.ARIA_DIALOG;
  const submitLabel = isSubmitting
    ? isEdit
      ? CREATE_RAFFLE_MODAL_UI.SUBMIT_EDIT_LOADING
      : CREATE_RAFFLE_MODAL_UI.SUBMIT_LOADING
    : isEdit
      ? CREATE_RAFFLE_MODAL_UI.SUBMIT_EDIT
      : CREATE_RAFFLE_MODAL_UI.SUBMIT;
  const hintText =
    isEdit && raffleToEdit?.status === "active"
      ? CREATE_RAFFLE_MODAL_UI.HINT_EDIT_ACTIVE
      : isEdit
        ? null
        : CREATE_RAFFLE_MODAL_UI.HINT;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const targetSales = Number(form.targetSales);
    if (!Number.isFinite(targetSales) || targetSales < 1) {
      setStatus({ kind: "error", message: "Укажите цель продаж (число ≥ 1)" });
      return;
    }

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      prizeImageUrl: form.prizeImageUrl.trim(),
      prizeImageFocus: form.prizeImageFocus,
      targetSales,
      instagramUrl: form.instagramUrl.trim(),
    };

    try {
      setStatus({ kind: "loading", message: "" });
      if (isEdit && raffleToEdit) {
        if (useStaffApi) {
          await patchRaffleByStaff(raffleToEdit._id, body);
        } else {
          await patchMyRaffle(raffleToEdit._id, body);
        }
      } else {
        await createRaffle(body);
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      const fallback = isEdit
        ? API_CLIENT_UI.PATCH_RAFFLE_FALLBACK
        : API_CLIENT_UI.CREATE_RAFFLE_FALLBACK;
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : fallback,
      });
    }
  };

  return (
    <div
      className="create-raffle-modal__backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="create-raffle-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaDialog}
        aria-labelledby="create-raffle-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="create-raffle-modal__header">
          <h2 id="create-raffle-modal-title">{modalTitle}</h2>
          <button
            type="button"
            className="create-raffle-modal__close"
            aria-label={CREATE_RAFFLE_MODAL_UI.ARIA_CLOSE}
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <form className="create-raffle-modal__form" onSubmit={handleSubmit}>
          <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_TITLE} required>
            <input
              type="text"
              value={form.title}
              required
              maxLength={120}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </FormFieldLabel>
          <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_DESCRIPTION}>
            <textarea
              value={form.description}
              rows={4}
              maxLength={4000}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </FormFieldLabel>
          <FormFieldLabel
            label={CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_IMAGE}
            required
          >
            <input
              type="url"
              value={form.prizeImageUrl}
              required
              placeholder="https://"
              onChange={(e) => {
                const nextUrl = e.target.value;
                setForm((prev) => {
                  const urlChanged =
                    nextUrl.trim() !== String(prev.prizeImageUrl ?? "").trim();
                  return {
                    ...prev,
                    prizeImageUrl: nextUrl,
                    prizeImageFocus: urlChanged
                      ? { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS }
                      : prev.prizeImageFocus,
                  };
                });
              }}
            />
          </FormFieldLabel>
          {prizeFocusImageUrl ? (
            <ProfileImageFocusEditor
              imageUrl={prizeFocusImageUrl}
              variant="raffle-prize"
              value={form.prizeImageFocus}
              onChange={(prizeImageFocus) =>
                setForm((prev) => ({ ...prev, prizeImageFocus }))
              }
              disabled={isSubmitting}
            />
          ) : null}
          <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_TARGET} required>
            <input
              type="number"
              min={1}
              value={form.targetSales}
              required
              onChange={(e) =>
                setForm((prev) => ({ ...prev, targetSales: e.target.value }))
              }
            />
          </FormFieldLabel>
          <FormFieldLabel
            label={CREATE_RAFFLE_MODAL_UI.LABEL_INSTAGRAM}
            required
          >
            <input
              type="url"
              value={form.instagramUrl}
              required
              placeholder="https://instagram.com/..."
              onChange={(e) =>
                setForm((prev) => ({ ...prev, instagramUrl: e.target.value }))
              }
            />
          </FormFieldLabel>
          {hintText ? (
            <p className="create-raffle-modal__hint">{hintText}</p>
          ) : null}
          {status.kind === "error" ? (
            <p className="create-raffle-modal__error" role="alert">
              {status.message}
            </p>
          ) : null}
          <footer className="create-raffle-modal__actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </button>
            <button
              type="submit"
              className="app-btn app-btn--primary"
              disabled={isSubmitting}
            >
              {submitLabel}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
