import { useEffect, useMemo, useState } from "react";

import { useRaffleMutations } from "../model/useRaffleMutations.js";
import { isHttpProfileImageUrl } from "../../user/lib/profileImageFocus.js";
import {
  resolveImageUrlForDisplay,
  resolveUploadedImageUrl,
} from "../../../shared/lib/resolveUploadedImageUrl.js";
import { ProfileImageFocusEditor } from "../../user/ui/ProfileImageFocusEditor.jsx";
import {
  DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS,
  getRafflePrizeImageFocus,
} from "../lib/rafflePrizeImageFocus.js";
import {
  normalizeRafflePrizeMediaType,
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
} from "../lib/isRafflePrizeVideo.js";
import { resolveRafflePrizeVideoUrl } from "../lib/resolveRafflePrizeVideoUrl.js";
import { RafflePrizeMedia } from "./RafflePrizeMedia.jsx";
import {
  API_CLIENT_UI,
  CREATE_RAFFLE_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { VideoUrlField } from "../../../shared/ui/VideoUrlField/VideoUrlField.jsx";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

import "./CreateRaffleModal.css";

const INITIAL_FORM = {
  title: "",
  description: "",
  prizeMediaType: RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  prizeImageUrl: "",
  prizeVideoUrl: "",
  prizeImageFocus: { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS },
  targetSales: "",
  instagramUrl: "",
};

/**
 * @param {import('../model/types.js').RaffleFromApi} raffle
 */
function formFromRaffle(raffle) {
  const prizeMediaType = normalizeRafflePrizeMediaType(raffle.prizeMediaType);
  return {
    title: raffle.title ?? "",
    description: raffle.description ?? "",
    prizeMediaType,
    prizeImageUrl: raffle.prizeImageUrl ?? "",
    prizeVideoUrl: raffle.prizeVideoUrl ?? "",
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
  const { createMutation, patchMyMutation, patchStaffMutation } = useRaffleMutations();
  const isEdit = mode === "edit" && raffleToEdit != null;
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setForm(isEdit ? formFromRaffle(raffleToEdit) : INITIAL_FORM);
    setStatus({ kind: "idle", message: "" });
  }, [isOpen, isEdit, raffleToEdit]);

  const isVideoMedia = form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;

  const prizeFocusImageUrl = useMemo(() => {
    const url = resolveImageUrlForDisplay(form.prizeImageUrl ?? "");
    return isHttpProfileImageUrl(url) ? url : "";
  }, [form.prizeImageUrl]);

  const previewRaffle = useMemo(
    () => ({
      prizeMediaType: form.prizeMediaType,
      prizeImageUrl: resolveUploadedImageUrl(form.prizeImageUrl.trim()),
      prizeVideoUrl: resolveUploadedImageUrl(form.prizeVideoUrl.trim()),
      prizeImageFocus: form.prizeImageFocus,
    }),
    [form.prizeImageFocus, form.prizeImageUrl, form.prizeMediaType, form.prizeVideoUrl],
  );

  const showPreview = useMemo(() => {
    if (isVideoMedia) {
      return Boolean(resolveRafflePrizeVideoUrl(previewRaffle));
    }
    return Boolean(prizeFocusImageUrl || form.prizeImageUrl.trim());
  }, [form.prizeImageUrl, isVideoMedia, previewRaffle, prizeFocusImageUrl]);

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

  const handleMediaTypeChange = (prizeMediaType) => {
    setForm((prev) => ({
      ...prev,
      prizeMediaType,
      prizeImageUrl:
        prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO ? "" : prev.prizeImageUrl,
      prizeVideoUrl:
        prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE ? "" : prev.prizeVideoUrl,
      prizeImageFocus:
        prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO
          ? { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS }
          : prev.prizeImageFocus,
    }));
  };

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
      prizeMediaType: form.prizeMediaType,
      prizeImageUrl: resolveUploadedImageUrl(form.prizeImageUrl.trim()),
      prizeVideoUrl: resolveUploadedImageUrl(form.prizeVideoUrl.trim()),
      prizeImageFocus: form.prizeImageFocus,
      targetSales,
      instagramUrl: form.instagramUrl.trim(),
    };

    try {
      setStatus({ kind: "loading", message: "" });
      if (isEdit && raffleToEdit) {
        if (useStaffApi) {
          await patchStaffMutation.mutateAsync({ raffleId: raffleToEdit._id, body });
        } else {
          await patchMyMutation.mutateAsync({ raffleId: raffleToEdit._id, body });
        }
      } else {
        await createMutation.mutateAsync(body);
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
    <div className="create-raffle-modal__backdrop" role="presentation">
      <div
        className="create-raffle-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaDialog}
        aria-labelledby="create-raffle-modal-title"
      >
        <header className="create-raffle-modal__header">
          <h2 id="create-raffle-modal-title">{modalTitle}</h2>
          <button
            type="button"
            className="create-raffle-modal__close"
            aria-label={CREATE_RAFFLE_MODAL_UI.ARIA_CLOSE}
            onClick={onClose}
          >
            <ModalCloseIcon />
          </button>
        </header>
        <form className="create-raffle-modal__form" onSubmit={handleSubmit}>
          <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_TITLE} required>
            <input
              type="text"
              value={form.title}
              required
              maxLength={120}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
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
          <fieldset className="create-raffle-modal__media-type">
            <legend>{CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA}</legend>
            <label className="create-raffle-modal__media-type-option">
              <input
                type="radio"
                name="prizeMediaType"
                value={RAFFLE_PRIZE_MEDIA_TYPE_IMAGE}
                checked={form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE}
                onChange={() => handleMediaTypeChange(RAFFLE_PRIZE_MEDIA_TYPE_IMAGE)}
                disabled={isSubmitting}
              />
              {CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA_TYPE_IMAGE}
            </label>
            <label className="create-raffle-modal__media-type-option">
              <input
                type="radio"
                name="prizeMediaType"
                value={RAFFLE_PRIZE_MEDIA_TYPE_VIDEO}
                checked={form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO}
                onChange={() => handleMediaTypeChange(RAFFLE_PRIZE_MEDIA_TYPE_VIDEO)}
                disabled={isSubmitting}
              />
              {CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA_TYPE_VIDEO}
            </label>
          </fieldset>
          {isVideoMedia ? (
            <FormFieldLabel required>
              {CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_VIDEO}
            </FormFieldLabel>
          ) : (
            <FormFieldLabel required>
              {CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_IMAGE}
            </FormFieldLabel>
          )}
          {isVideoMedia ? (
            <VideoUrlField
              value={form.prizeVideoUrl}
              required
              onChange={(nextUrl) =>
                setForm((prev) => ({ ...prev, prizeVideoUrl: nextUrl }))
              }
              disabled={isSubmitting}
            />
          ) : (
            <ImageUrlField
              value={form.prizeImageUrl}
              required
              onChange={(nextUrl) => {
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
              disabled={isSubmitting}
            />
          )}
          {!isVideoMedia && prizeFocusImageUrl ? (
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
          {showPreview ? (
            <div className="create-raffle-modal__preview">
              <span className="create-raffle-modal__preview-label">
                {CREATE_RAFFLE_MODAL_UI.PREVIEW_LABEL}
              </span>
              <div className="create-raffle-modal__preview-frame">
                <RafflePrizeMedia
                  raffle={previewRaffle}
                  className="raffle-prize-media"
                  videoClassName="raffle-prize-media raffle-prize-media_video"
                  imageClassName="raffle-prize-media"
                />
              </div>
            </div>
          ) : null}
          <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_TARGET} required>
            <input
              {...INTEGER_INPUT_FIELD_PROPS}
              value={form.targetSales}
              required
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  targetSales: keepDigitsOnly(e.target.value),
                }))
              }
            />
          </FormFieldLabel>
          <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_INSTAGRAM} required>
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
          {hintText ? <p className="create-raffle-modal__hint">{hintText}</p> : null}
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
