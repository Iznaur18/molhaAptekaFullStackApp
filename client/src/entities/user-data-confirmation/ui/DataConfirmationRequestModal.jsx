import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { countWords } from "../../user/lib/countWords.js";
import { fetchMyDataConfirmationStatus } from "../api/fetchMyDataConfirmationStatus.js";
import { submitDataConfirmationRequest } from "../api/submitDataConfirmationRequest.js";
import { emptyPassportForm } from "../lib/emptyPassportForm.js";
import { validatePassportForm } from "../lib/validatePassportForm.js";
import {
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "../model/constants.js";
import { uploadImage } from "../../../shared/api/uploadImage.js";
import {
  DATA_CONFIRMATION_MODAL_UI,
  DATA_CONFIRMATION_PAGE_UI,
  IMAGE_URL_FIELD_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { UPLOAD_FILE_INPUT_ACCEPT } from "../../../shared/config/uploadConstants.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { validateUploadImageFile } from "../../../shared/lib/validateUploadImageFile.js";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./DataConfirmationRequestModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSubmitted?: () => void;
 * }} props
 */
export function DataConfirmationRequestModal({ isOpen, onClose, onSubmitted }) {
  const [phase, setPhase] = useState("loading");
  const [isUserDataConfirmed, setIsUserDataConfirmed] = useState(false);
  const [requestStatus, setRequestStatus] = useState(
    /** @type {string | null} */ (null),
  );
  const [staffNote, setStaffNote] = useState("");
  const [form, setForm] = useState(emptyPassportForm);
  const [selfieFile, setSelfieFile] = useState(/** @type {File | null} */ (null));
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selfieFileInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));

  useEffect(() => {
    if (!selfieFile) {
      setSelfiePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selfieFile);
    setSelfiePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selfieFile]);

  useEffect(() => {
    if (!isOpen) return undefined;

    let isCancelled = false;
    setPhase("loading");
    setError("");
    setSelfieFile(null);

    void (async () => {
      try {
        const status = await fetchMyDataConfirmationStatus();
        if (isCancelled) return;
        setIsUserDataConfirmed(status.isUserDataConfirmed);
        setRequestStatus(status.request?.status ?? null);
        setStaffNote(
          status.request?.status === USER_DATA_CONFIRMATION_STATUS_REJECTED
            ? String(status.request.staffNote ?? "").trim()
            : "",
        );
        setForm(emptyPassportForm());
        setPhase("ready");
      } catch (e) {
        if (isCancelled) return;
        setError(e instanceof Error ? e.message : "Ошибка");
        setPhase("error");
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const canSubmit =
    !isUserDataConfirmed && requestStatus !== USER_DATA_CONFIRMATION_STATUS_PENDING;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validatePassportForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!selfieFile) {
      setError(DATA_CONFIRMATION_MODAL_UI.ERROR_PASSPORT_SELFIE_REQUIRED);
      return;
    }

    const fileError = validateUploadImageFile(selfieFile);
    if (fileError) {
      setError(fileError);
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      let passportSelfiePhotoUrl;
      try {
        passportSelfiePhotoUrl = await uploadImage(selfieFile);
      } catch (uploadError) {
        throw new Error(
          uploadError instanceof Error
            ? uploadError.message
            : DATA_CONFIRMATION_MODAL_UI.ERROR_PASSPORT_SELFIE_UPLOAD,
        );
      }

      await submitDataConfirmationRequest({
        passport: {
          ...form,
          lastName: form.lastName.trim(),
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim(),
          series: form.series.trim(),
          number: form.number.trim(),
          issuedBy: form.issuedBy.trim(),
          departmentCode: form.departmentCode.trim(),
        },
        passportSelfiePhotoUrl,
      });
      onSubmitted?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelfieFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) {
      setSelfieFile(null);
      return;
    }

    const fileError = validateUploadImageFile(file);
    if (fileError) {
      setError(fileError);
      setSelfieFile(null);
      return;
    }

    setError("");
    setSelfieFile(file);
  };

  const handlePickSelfieFile = () => {
    if (isSubmitting) {
      return;
    }
    selfieFileInputRef.current?.click();
  };

  return createPortal(
    <div className="data-confirmation-modal__backdrop" role="presentation">
      <div
        className="data-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-confirmation-modal-title"
      >
        <header className="data-confirmation-modal__header">
          <h2 id="data-confirmation-modal-title">{DATA_CONFIRMATION_MODAL_UI.TITLE}</h2>
          <button
            type="button"
            className="data-confirmation-modal__close"
            onClick={onClose}
            aria-label={USER_DETAILS_MODAL_UI.ARIA_CLOSE}
          >
            <ModalCloseIcon />
          </button>
        </header>

        {phase === "loading" ? (
          <p className="data-confirmation-modal__state">
            {DATA_CONFIRMATION_PAGE_UI.LOADING}
          </p>
        ) : null}

        {phase === "error" && !canSubmit ? (
          <p className="data-confirmation-modal__state_error" role="alert">
            {error}
          </p>
        ) : null}

        {phase === "ready" && isUserDataConfirmed ? (
          <p className="data-confirmation-modal__status data-confirmation-modal__status_ok">
            {DATA_CONFIRMATION_MODAL_UI.STATUS_CONFIRMED}
          </p>
        ) : null}

        {phase === "ready" &&
        requestStatus === USER_DATA_CONFIRMATION_STATUS_PENDING ? (
          <p className="data-confirmation-modal__status">
            {DATA_CONFIRMATION_MODAL_UI.STATUS_PENDING}
          </p>
        ) : null}

        {phase === "ready" &&
        requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED ? (
          <div className="data-confirmation-modal__reject">
            <p className="data-confirmation-modal__status data-confirmation-modal__status_reject">
              {DATA_CONFIRMATION_MODAL_UI.STATUS_REJECTED_TITLE}
            </p>
            {staffNote ? (
              <p className="data-confirmation-modal__staff-note">{staffNote}</p>
            ) : null}
          </div>
        ) : null}

        {phase === "ready" && canSubmit ? (
          <>
            <p className="data-confirmation-modal__intro">
              {DATA_CONFIRMATION_MODAL_UI.INTRO}
            </p>
            <form className="data-confirmation-modal__form" onSubmit={handleSubmit}>
              <div className="data-confirmation-modal__grid">
                <label>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_LAST_NAME}
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    autoComplete="family-name"
                  />
                </label>
                <label>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_FIRST_NAME}
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    autoComplete="given-name"
                  />
                </label>
                <label>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_MIDDLE_NAME}
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={(e) => updateField("middleName", e.target.value)}
                    autoComplete="additional-name"
                  />
                </label>
                <label>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_BIRTH_DATE}
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => updateField("birthDate", e.target.value)}
                  />
                </label>
                <label>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_SERIES}
                  <input
                    {...INTEGER_INPUT_FIELD_PROPS}
                    maxLength={4}
                    value={form.series}
                    onChange={(e) =>
                      updateField("series", keepDigitsOnly(e.target.value))
                    }
                  />
                </label>
                <label>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_NUMBER}
                  <input
                    {...INTEGER_INPUT_FIELD_PROPS}
                    maxLength={6}
                    value={form.number}
                    onChange={(e) =>
                      updateField("number", keepDigitsOnly(e.target.value))
                    }
                  />
                </label>
                <label className="data-confirmation-modal__field_wide">
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_ISSUED_BY}
                  <textarea
                    rows={2}
                    value={form.issuedBy}
                    onChange={(e) => updateField("issuedBy", e.target.value)}
                  />
                </label>
                <label>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_ISSUED_AT}
                  <input
                    type="date"
                    value={form.issuedAt}
                    onChange={(e) => updateField("issuedAt", e.target.value)}
                  />
                </label>
                <label>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_DEPARTMENT_CODE}
                  <input
                    type="text"
                    placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DEPARTMENT_CODE}
                    value={form.departmentCode}
                    onChange={(e) => updateField("departmentCode", e.target.value)}
                  />
                </label>
              </div>

              <label className="data-confirmation-modal__selfie">
                <span>{DATA_CONFIRMATION_MODAL_UI.LABEL_PASSPORT_SELFIE}</span>
                <span className="data-confirmation-modal__selfie-hint">
                  {DATA_CONFIRMATION_MODAL_UI.HINT_PASSPORT_SELFIE}
                </span>
                <div className="data-confirmation-modal__selfie-upload">
                  <button
                    type="button"
                    className="data-confirmation-modal__file-btn"
                    onClick={handlePickSelfieFile}
                    disabled={isSubmitting}
                  >
                    {IMAGE_URL_FIELD_UI.UPLOAD_BUTTON}
                  </button>
                  {selfieFile ? (
                    <span className="data-confirmation-modal__file-name">
                      {selfieFile.name}
                    </span>
                  ) : null}
                </div>
                <input
                  ref={selfieFileInputRef}
                  className="data-confirmation-modal__file-input"
                  type="file"
                  accept={UPLOAD_FILE_INPUT_ACCEPT}
                  aria-label={IMAGE_URL_FIELD_UI.FILE_INPUT_ARIA}
                  tabIndex={-1}
                  onChange={handleSelfieFileChange}
                  disabled={isSubmitting}
                />
                {selfiePreviewUrl ? (
                  <img
                    className="data-confirmation-modal__selfie-preview"
                    src={resolveImageUrlForDisplay(selfiePreviewUrl)}
                    alt=""
                  />
                ) : null}
              </label>

              {error ? (
                <p className="data-confirmation-modal__state_error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="data-confirmation-modal__actions">
                <button type="button" onClick={onClose}>
                  {DATA_CONFIRMATION_MODAL_UI.CANCEL}
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? DATA_CONFIRMATION_MODAL_UI.SUBMIT_LOADING
                    : DATA_CONFIRMATION_MODAL_UI.SUBMIT}
                </button>
              </div>
            </form>
          </>
        ) : null}

        {phase === "ready" && !canSubmit ? (
          <div className="data-confirmation-modal__actions">
            <button type="button" onClick={onClose}>
              {DATA_CONFIRMATION_MODAL_UI.CANCEL}
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
