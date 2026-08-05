import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useSubmitDataConfirmationRequestMutation } from "../model/useSubmitDataConfirmationRequestMutation.js";
import {
  clearDataConfirmationFormDraft,
  persistDataConfirmationFormDraft,
  readDataConfirmationFormDraft,
} from "../lib/dataConfirmationFormDraftStorage.js";
import { emptyPassportForm } from "../lib/emptyPassportForm.js";
import {
  maskPassportDateInput,
  parsePassportDateInputToIso,
} from "../lib/passportDateInputMask.js";
import { maskPassportDepartmentCodeInput } from "../lib/passportDepartmentCodeInputMask.js";
import { validatePassportForm } from "../lib/validatePassportForm.js";
import {
  PASSPORT_FORM_STEP_COUNT,
  PASSPORT_FORM_STEP_IDENTITY,
  PASSPORT_FORM_STEP_PASSPORT,
  PASSPORT_FORM_STEP_SELFIE,
  validatePassportFormStep,
} from "../lib/validatePassportFormStep.js";
import { useMyDataConfirmationStatusQuery } from "../model/useMyDataConfirmationStatusQuery.js";
import {
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "../model/constants.js";
import { useAuthSession } from "../../user/model/useAuthSession.js";
import { useUploadAssetMutations } from "../../../shared/model/useUploadAssetMutations.js";
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

const STEP_TITLES = [
  DATA_CONFIRMATION_MODAL_UI.STEP_IDENTITY,
  DATA_CONFIRMATION_MODAL_UI.STEP_PASSPORT,
  DATA_CONFIRMATION_MODAL_UI.STEP_SELFIE,
];

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSubmitted?: () => void;
 * }} props
 */
export function DataConfirmationRequestModal({ isOpen, onClose, onSubmitted }) {
  const { currentUserId } = useAuthSession();
  const submitRequestMutation = useSubmitDataConfirmationRequestMutation();
  const { uploadImageMutation } = useUploadAssetMutations();
  const statusQuery = useMyDataConfirmationStatusQuery({ enabled: isOpen });
  const [form, setForm] = useState(emptyPassportForm);
  const [selfieFile, setSelfieFile] = useState(/** @type {File | null} */ (null));
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(PASSPORT_FORM_STEP_IDENTITY);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const isSubmitting =
    submitRequestMutation.isPending || uploadImageMutation.isPending;
  const selfieFileInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));

  const status = statusQuery.data;
  const phase = statusQuery.isPending
    ? "loading"
    : statusQuery.isError
      ? "error"
      : "ready";
  const fetchError =
    statusQuery.error instanceof Error ? statusQuery.error.message : "Ошибка";
  const isUserDataConfirmed = status?.isUserDataConfirmed ?? false;
  const requestStatus = status?.request?.status ?? null;
  const staffNote =
    requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED
      ? String(status?.request?.staffNote ?? "").trim()
      : "";

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
    if (!isOpen) {
      setIsDraftHydrated(false);
      return;
    }
    setError("");
    setSelfieFile(null);
    const draft = currentUserId
      ? readDataConfirmationFormDraft(currentUserId)
      : null;
    if (draft) {
      setForm(draft.form);
      setStep(draft.step);
    } else {
      setForm(emptyPassportForm());
      setStep(PASSPORT_FORM_STEP_IDENTITY);
    }
    setIsDraftHydrated(true);
  }, [isOpen, currentUserId]);

  useEffect(() => {
    if (!isOpen || !currentUserId || !isDraftHydrated) {
      return;
    }
    persistDataConfirmationFormDraft(currentUserId, { form, step });
  }, [isOpen, currentUserId, form, step, isDraftHydrated]);

  useScrollLock(isOpen, { strategy: "overflow" });

  // iOS rubber-band: overflow:hidden alone не стопит скролл за модалкой.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const isInsideModal = (target) => {
      if (!(target instanceof Element)) {
        return false;
      }
      return Boolean(target.closest(".data-confirmation-modal"));
    };

    const blockBackgroundScroll = (event) => {
      if (isInsideModal(event.target)) {
        return;
      }
      event.preventDefault();
    };

    document.addEventListener("touchmove", blockBackgroundScroll, { passive: false });
    document.addEventListener("wheel", blockBackgroundScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockBackgroundScroll);
      document.removeEventListener("wheel", blockBackgroundScroll);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit =
    !isUserDataConfirmed && requestStatus !== USER_DATA_CONFIRMATION_STATUS_PENDING;
  const displayError = error || (phase === "error" ? fetchError : "");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    const stepError = validatePassportFormStep(form, step);
    if (stepError) {
      setError(stepError);
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, PASSPORT_FORM_STEP_SELFIE));
  };

  const handleBackStep = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, PASSPORT_FORM_STEP_IDENTITY));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step !== PASSPORT_FORM_STEP_SELFIE) {
      handleNextStep();
      return;
    }

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

    const birthDateIso = parsePassportDateInputToIso(form.birthDate);
    const issuedAtIso = parsePassportDateInputToIso(form.issuedAt);
    if (!birthDateIso || !issuedAtIso) {
      setError("Проверьте даты: ДД.ММ.ГГГГ");
      return;
    }

    setError("");
    try {
      let passportSelfiePhotoUrl;
      try {
        passportSelfiePhotoUrl = await uploadImageMutation.mutateAsync({
          file: selfieFile,
          purpose: "passport-selfie",
        });
      } catch (uploadError) {
        throw new Error(
          uploadError instanceof Error
            ? uploadError.message
            : DATA_CONFIRMATION_MODAL_UI.ERROR_PASSPORT_SELFIE_UPLOAD,
        );
      }

      await submitRequestMutation.mutateAsync({
        passport: {
          ...form,
          lastName: form.lastName.trim(),
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim(),
          birthDate: birthDateIso,
          series: form.series.trim(),
          number: form.number.trim(),
          issuedBy: form.issuedBy.trim(),
          issuedAt: issuedAtIso,
          departmentCode: form.departmentCode.trim(),
        },
        passportSelfiePhotoUrl,
      });
      clearDataConfirmationFormDraft(currentUserId);
      onSubmitted?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
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
      <div className="data-confirmation-modal__keyboard-bleed" aria-hidden="true" />
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
            {displayError}
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
              <div className="data-confirmation-modal__step-meta">
                <p className="data-confirmation-modal__step-progress">
                  {DATA_CONFIRMATION_MODAL_UI.STEP_PROGRESS(
                    step + 1,
                    PASSPORT_FORM_STEP_COUNT,
                  )}
                </p>
                <p className="data-confirmation-modal__step-title">{STEP_TITLES[step]}</p>
              </div>

              {step === PASSPORT_FORM_STEP_IDENTITY ? (
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
                      type="text"
                      inputMode="numeric"
                      autoComplete="bday"
                      placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DATE}
                      maxLength={10}
                      value={form.birthDate}
                      onChange={(e) =>
                        updateField("birthDate", maskPassportDateInput(e.target.value))
                      }
                    />
                  </label>
                </div>
              ) : null}

              {step === PASSPORT_FORM_STEP_PASSPORT ? (
                <div className="data-confirmation-modal__grid">
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
                      type="text"
                      inputMode="numeric"
                      placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DATE}
                      maxLength={10}
                      value={form.issuedAt}
                      onChange={(e) =>
                        updateField("issuedAt", maskPassportDateInput(e.target.value))
                      }
                    />
                  </label>
                  <label>
                    {DATA_CONFIRMATION_MODAL_UI.LABEL_DEPARTMENT_CODE}
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DEPARTMENT_CODE}
                      maxLength={7}
                      value={form.departmentCode}
                      onChange={(e) =>
                        updateField(
                          "departmentCode",
                          maskPassportDepartmentCodeInput(e.target.value),
                        )
                      }
                    />
                  </label>
                </div>
              ) : null}

              {step === PASSPORT_FORM_STEP_SELFIE ? (
                <div className="data-confirmation-modal__selfie">
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
                </div>
              ) : null}

              {displayError ? (
                <p className="data-confirmation-modal__state_error" role="alert">
                  {displayError}
                </p>
              ) : null}
              <div className="data-confirmation-modal__actions">
                {step > PASSPORT_FORM_STEP_IDENTITY ? (
                  <button
                    type="button"
                    className="app-btn app-btn--cancel"
                    onClick={handleBackStep}
                    disabled={isSubmitting}
                  >
                    {DATA_CONFIRMATION_MODAL_UI.BACK}
                  </button>
                ) : (
                  <button type="button" className="app-btn app-btn--cancel" onClick={onClose}>
                    {DATA_CONFIRMATION_MODAL_UI.CANCEL}
                  </button>
                )}
                {step < PASSPORT_FORM_STEP_SELFIE ? (
                  <button
                    type="button"
                    className="app-btn app-btn--primary"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                  >
                    {DATA_CONFIRMATION_MODAL_UI.NEXT}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="app-btn app-btn--primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? DATA_CONFIRMATION_MODAL_UI.SUBMIT_LOADING
                      : DATA_CONFIRMATION_MODAL_UI.SUBMIT}
                  </button>
                )}
              </div>
            </form>
          </>
        ) : null}

        {phase === "ready" && !canSubmit ? (
          <div className="data-confirmation-modal__actions">
            <button type="button" className="app-btn app-btn--cancel" onClick={onClose}>
              {DATA_CONFIRMATION_MODAL_UI.CANCEL}
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
