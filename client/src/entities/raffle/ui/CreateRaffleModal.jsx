import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_VIEWER_REGION_CODE,
  RAFFLE_DESCRIPTION_MAX_LENGTH,
  RAFFLE_TITLE_MAX_LENGTH,
  isRuRegionCode,
} from "@molha/api-contract";

import { useRaffleMutations } from "../model/useRaffleMutations.js";
import { useMyRaffleQuery } from "../model/useMyRaffleQuery.js";
import { useRaffleCreateAdvertisingQuery } from "../model/useRaffleCreateAdvertisingQuery.js";
import { useCancelRaffleCreateMutation } from "../model/useCancelRaffleCreateMutation.js";
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
import {
  CREATE_RAFFLE_WIZARD_STEPS,
  isCreateRaffleFormDirty,
  resolveCreateRaffleWizardStepCopy,
  validateCreateRaffleFormStep,
} from "../lib/createRaffleWizard.js";
import { resolveCreateRaffleBlockNotice } from "../lib/resolveCreateRaffleBlockNotice.js";
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
import { ProductWizardProgress } from "../../../shared/ui/ProductWizardProgress/ProductWizardProgress.jsx";
import { ProductWizardStepHeadline } from "../../../shared/ui/ProductWizardProgress/ProductWizardStepHeadline.jsx";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { RuRegionSelect } from "../../region/ui/RuRegionSelect.jsx";

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
  regionCode: DEFAULT_VIEWER_REGION_CODE,
};

const LAST_WIZARD_STEP_INDEX = CREATE_RAFFLE_WIZARD_STEPS.length - 1;

/**
 * @param {import('../model/types.js').RaffleFromApi} raffle
 */
function formFromRaffle(raffle) {
  const prizeMediaType = normalizeRafflePrizeMediaType(raffle.prizeMediaType);
  const regionRaw = String(raffle.regionCode ?? "").trim();
  return {
    title: raffle.title ?? "",
    description: raffle.description ?? "",
    prizeMediaType,
    prizeImageUrl: raffle.prizeImageUrl ?? "",
    prizeVideoUrl: raffle.prizeVideoUrl ?? "",
    prizeImageFocus: getRafflePrizeImageFocus(raffle),
    targetSales: String(raffle.targetSales ?? ""),
    instagramUrl: raffle.instagramUrl ?? "",
    regionCode: isRuRegionCode(regionRaw) ? regionRaw : DEFAULT_VIEWER_REGION_CODE,
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
  const { createMutation, patchMyMutation, patchStaffMutation, deleteMyMutation } =
    useRaffleMutations();
  const cancelCreateMutation = useCancelRaffleCreateMutation();
  const isEdit = mode === "edit" && raffleToEdit != null;
  const myRaffleQuery = useMyRaffleQuery({ enabled: isOpen && !isEdit });
  const createAccessQuery = useRaffleCreateAdvertisingQuery({ enabled: isOpen && !isEdit });
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [stepIndex, setStepIndex] = useState(0);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setForm(isEdit ? formFromRaffle(raffleToEdit) : INITIAL_FORM);
    setStatus({ kind: "idle", message: "" });
    setStepIndex(0);
  }, [isOpen, isEdit, raffleToEdit]);

  const isVideoMedia = form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;
  const stepId = CREATE_RAFFLE_WIZARD_STEPS[stepIndex] ?? CREATE_RAFFLE_WIZARD_STEPS[0];
  const stepCopy = resolveCreateRaffleWizardStepCopy(stepId);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === LAST_WIZARD_STEP_INDEX;
  const existingRaffle = myRaffleQuery.data?.raffle ?? null;
  const blockNotice = useMemo(
    () => (isEdit ? null : resolveCreateRaffleBlockNotice(existingRaffle)),
    [existingRaffle, isEdit],
  );
  const isCreateBlocked = Boolean(blockNotice);
  const isWithdrawing = deleteMyMutation.isPending;
  const isCancelling = cancelCreateMutation.isPending;

  const prizeFocusImageUrl = useMemo(() => {
    const url = resolveImageUrlForDisplay(form.prizeImageUrl ?? "");
    return isHttpProfileImageUrl(url) ? url : "";
  }, [form.prizeImageUrl]);

  if (!isOpen) return null;

  const isSubmitting = status.kind === "loading" || isWithdrawing || isCancelling;
  const wizardActionsDisabled = isSubmitting || isCreateBlocked;
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
  const primaryLabel = !isEdit && !isLastStep ? CREATE_RAFFLE_MODAL_UI.BTN_NEXT : submitLabel;
  const hintText =
    isEdit && raffleToEdit?.status === "active"
      ? CREATE_RAFFLE_MODAL_UI.HINT_EDIT_ACTIVE
      : isEdit
        ? null
        : isLastStep
          ? CREATE_RAFFLE_MODAL_UI.HINT
          : null;

  const showBasicSection = isEdit || stepId === "basic";
  const showPrizeSection = isEdit || stepId === "prize";
  const showConditionsSection = isEdit || stepId === "conditions";

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

  const requestClose = () => {
    if (
      !isEdit &&
      (isCreateRaffleFormDirty(form) || stepIndex > 0) &&
      !window.confirm(
        `${CREATE_RAFFLE_MODAL_UI.DISCARD_TITLE}\n\n${CREATE_RAFFLE_MODAL_UI.DISCARD_MESSAGE}`,
      )
    ) {
      return;
    }
    onClose();
  };

  const resetWizard = () => {
    setForm(INITIAL_FORM);
    setStepIndex(0);
    setStatus({ kind: "idle", message: "" });
  };

  const runCancelCreate = async () => {
    try {
      setStatus({ kind: "idle", message: "" });
      const hasPaidUnlock = createAccessQuery.data?.hasPaidUnlock === true;
      if (hasPaidUnlock) {
        await cancelCreateMutation.mutateAsync();
      }
      resetWizard();
      onClose();
    } catch (error) {
      setStatus({
        kind: "error",
        message: error?.message ?? API_CLIENT_UI.CANCEL_RAFFLE_CREATE_FALLBACK,
      });
    }
  };

  const handleCancelCreate = () => {
    if (isEdit) {
      requestClose();
      return;
    }

    if (blockNotice?.canWithdraw && existingRaffle?._id) {
      if (
        !window.confirm(
          `${CREATE_RAFFLE_MODAL_UI.WITHDRAW_CONFIRM_TITLE}\n\n${CREATE_RAFFLE_MODAL_UI.WITHDRAW_CONFIRM}`,
        )
      ) {
        return;
      }
      void (async () => {
        try {
          setStatus({ kind: "idle", message: "" });
          await deleteMyMutation.mutateAsync(existingRaffle._id);
          resetWizard();
          onClose();
        } catch (error) {
          setStatus({
            kind: "error",
            message: error?.message ?? API_CLIENT_UI.DELETE_RAFFLE_FALLBACK,
          });
        }
      })();
      return;
    }

    const hasPaidUnlock = createAccessQuery.data?.hasPaidUnlock === true;
    const pricePoints = createAccessQuery.data?.pricePoints ?? 3_000;
    const shouldConfirmDiscard = isCreateRaffleFormDirty(form) || stepIndex > 0;

    if (hasPaidUnlock) {
      const message = shouldConfirmDiscard
        ? `${CREATE_RAFFLE_MODAL_UI.CANCEL_CREATE_MESSAGE(pricePoints)}\n\n${CREATE_RAFFLE_MODAL_UI.DISCARD_MESSAGE}`
        : CREATE_RAFFLE_MODAL_UI.CANCEL_CREATE_MESSAGE(pricePoints);
      if (
        !window.confirm(`${CREATE_RAFFLE_MODAL_UI.CANCEL_CREATE_TITLE}\n\n${message}`)
      ) {
        return;
      }
      void runCancelCreate();
      return;
    }

    requestClose();
  };

  const goNext = () => {
    if (isCreateBlocked) {
      return;
    }
    const stepError = validateCreateRaffleFormStep(stepId, form);
    if (stepError) {
      setStatus({ kind: "error", message: stepError });
      return;
    }
    setStatus({ kind: "idle", message: "" });
    setStepIndex((prev) => Math.min(prev + 1, LAST_WIZARD_STEP_INDEX));
  };

  const handleWithdraw = async () => {
    if (!existingRaffle?._id || !blockNotice?.canWithdraw) {
      return;
    }
    if (
      !window.confirm(
        `${CREATE_RAFFLE_MODAL_UI.WITHDRAW_CONFIRM_TITLE}\n\n${CREATE_RAFFLE_MODAL_UI.WITHDRAW_CONFIRM}`,
      )
    ) {
      return;
    }

    try {
      setStatus({ kind: "idle", message: "" });
      await deleteMyMutation.mutateAsync(existingRaffle._id);
      setStatus({ kind: "success", message: CREATE_RAFFLE_MODAL_UI.WITHDRAW_SUCCESS });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error?.message ?? API_CLIENT_UI.DELETE_RAFFLE_FALLBACK,
      });
    }
  };

  const goBack = () => {
    setStatus({ kind: "idle", message: "" });
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const submitRaffle = async () => {
    if (!isEdit && isCreateBlocked) {
      return;
    }

    const targetSales = Number(form.targetSales);
    if (!Number.isFinite(targetSales) || targetSales < 1) {
      setStatus({ kind: "error", message: CREATE_RAFFLE_MODAL_UI.ERROR_TARGET });
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
      regionCode: form.regionCode,
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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!isEdit) {
      if (!isLastStep) {
        return;
      }
      const stepError = validateCreateRaffleFormStep(stepId, form);
      if (stepError) {
        setStatus({ kind: "error", message: stepError });
        return;
      }
    }
    await submitRaffle();
  };

  const handlePrimaryClick = () => {
    if (!isEdit && !isLastStep) {
      goNext();
    }
  };

  return (
    <div className="create-raffle-modal__backdrop" role="presentation">
      <div className="create-raffle-modal__keyboard-bleed" aria-hidden="true" />
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
            onClick={handleCancelCreate}
          >
            <ModalCloseIcon />
          </button>
        </header>
        <form className="create-raffle-modal__form" onSubmit={handleFormSubmit} noValidate>
          {!isEdit ? (
            <div className="create-raffle-modal__wizard">
              <ProductWizardProgress
                stepIds={CREATE_RAFFLE_WIZARD_STEPS}
                stepIndex={stepIndex}
                resolveStepCopy={resolveCreateRaffleWizardStepCopy}
                progressAria={CREATE_RAFFLE_MODAL_UI.WIZARD_PROGRESS_ARIA}
              />
              <ProductWizardStepHeadline
                title={stepCopy.title}
                subtitle={stepCopy.subtitle}
              />
            </div>
          ) : null}

          {!isEdit && isFirstStep && blockNotice ? (
            <div className="create-raffle-modal__block-notice" role="alert">
              <p className="create-raffle-modal__block-notice-text">{blockNotice.message}</p>
              {blockNotice.canWithdraw ? (
                <button
                  type="button"
                  className="app-btn app-btn--danger create-raffle-modal__block-notice-btn"
                  onClick={() => void handleWithdraw()}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing
                    ? CREATE_RAFFLE_MODAL_UI.SUBMIT_LOADING
                    : CREATE_RAFFLE_MODAL_UI.BTN_WITHDRAW}
                </button>
              ) : null}
            </div>
          ) : null}

          {showBasicSection ? (
            <section className="create-raffle-modal__section">
              {isEdit ? (
                <h3 className="create-raffle-modal__section-title">
                  {CREATE_RAFFLE_MODAL_UI.SECTION_BASIC}
                </h3>
              ) : null}
              <div className="create-raffle-modal__section-body">
                <div className="create-raffle-modal__field">
                  <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_TITLE} required>
                    <input
                      type="text"
                      value={form.title}
                      required
                      maxLength={RAFFLE_TITLE_MAX_LENGTH}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </FormFieldLabel>
                  <p className="create-raffle-modal__field-hint">
                    {CREATE_RAFFLE_MODAL_UI.HINT_TITLE}
                  </p>
                </div>
                <div className="create-raffle-modal__field">
                  <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_REGION} required>
                    <RuRegionSelect
                      value={form.regionCode}
                      disabled={isSubmitting}
                      required
                      onChange={(regionCode) =>
                        setForm((prev) => ({ ...prev, regionCode }))
                      }
                    />
                  </FormFieldLabel>
                  <p className="create-raffle-modal__field-hint">
                    {CREATE_RAFFLE_MODAL_UI.HINT_REGION}
                  </p>
                </div>
                <div className="create-raffle-modal__field">
                  <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_DESCRIPTION}>
                    <textarea
                      value={form.description}
                      rows={4}
                      maxLength={RAFFLE_DESCRIPTION_MAX_LENGTH}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </FormFieldLabel>
                  <p className="create-raffle-modal__field-hint">
                    {CREATE_RAFFLE_MODAL_UI.HINT_DESCRIPTION}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {showPrizeSection ? (
            <section className="create-raffle-modal__section">
              {isEdit ? (
                <h3 className="create-raffle-modal__section-title">
                  {CREATE_RAFFLE_MODAL_UI.SECTION_PRIZE}
                </h3>
              ) : null}
              <div className="create-raffle-modal__section-body">
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
                  <p className="create-raffle-modal__field-hint">
                    {CREATE_RAFFLE_MODAL_UI.HINT_PRIZE_MEDIA}
                  </p>
                </fieldset>
                <div className="create-raffle-modal__field">
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
                  <p className="create-raffle-modal__field-hint">
                    {isVideoMedia
                      ? CREATE_RAFFLE_MODAL_UI.HINT_PRIZE_VIDEO
                      : CREATE_RAFFLE_MODAL_UI.HINT_PRIZE_IMAGE}
                  </p>
                </div>
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
              </div>
            </section>
          ) : null}

          {showConditionsSection ? (
            <section className="create-raffle-modal__section">
              {isEdit ? (
                <h3 className="create-raffle-modal__section-title">
                  {CREATE_RAFFLE_MODAL_UI.SECTION_CONDITIONS}
                </h3>
              ) : null}
              <div className="create-raffle-modal__section-body">
                <div className="create-raffle-modal__field">
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
                  <p className="create-raffle-modal__field-hint">
                    {CREATE_RAFFLE_MODAL_UI.HINT_TARGET}
                  </p>
                </div>
                <div className="create-raffle-modal__field">
                  <FormFieldLabel label={CREATE_RAFFLE_MODAL_UI.LABEL_INSTAGRAM}>
                    <input
                      type="url"
                      value={form.instagramUrl}
                      placeholder="https://instagram.com/..."
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, instagramUrl: e.target.value }))
                      }
                    />
                  </FormFieldLabel>
                  <p className="create-raffle-modal__field-hint">
                    {CREATE_RAFFLE_MODAL_UI.HINT_INSTAGRAM}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {hintText ? <p className="create-raffle-modal__hint">{hintText}</p> : null}
          {status.kind === "success" ? (
            <p className="create-raffle-modal__success" role="status">
              {status.message}
            </p>
          ) : null}
          {status.kind === "error" ? (
            <p className="create-raffle-modal__error" role="alert">
              {status.message}
            </p>
          ) : null}
          <footer
            className={[
              "create-raffle-modal__actions",
              !isEdit ? "create-raffle-modal__actions_wizard" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <button
              type="button"
              className="app-btn app-btn--secondary"
              onClick={handleCancelCreate}
              disabled={isSubmitting}
            >
              {CREATE_RAFFLE_MODAL_UI.BTN_CANCEL}
            </button>
            {!isEdit && !isFirstStep ? (
              <button
                type="button"
                className="app-btn app-btn--secondary"
                onClick={goBack}
                disabled={isSubmitting}
              >
                {CREATE_RAFFLE_MODAL_UI.BTN_BACK}
              </button>
            ) : null}
            <button
              type={isEdit || isLastStep ? "submit" : "button"}
              className="app-btn app-btn--primary"
              disabled={wizardActionsDisabled}
              onClick={isEdit || isLastStep ? undefined : handlePrimaryClick}
            >
              {primaryLabel}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
