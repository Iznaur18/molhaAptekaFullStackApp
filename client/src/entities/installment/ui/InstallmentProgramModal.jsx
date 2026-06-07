import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useInstallmentMutations } from "../model/useInstallmentMutations.js";
import { useProductInstallmentProgramQuery } from "../model/useProductInstallmentProgramQuery.js";
import {
  INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
  INSTALLMENT_MONTHS_MAX,
  INSTALLMENT_MONTHS_MIN,
  INSTALLMENT_PLANS_MAX,
} from "../model/constants.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

import "./InstallmentProgramModal.css";

const EMPTY_PLAN = {
  title: "",
  monthsCount: 3,
  monthlyAmountRub: INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
  firstPaymentRequiredNow: true,
};

/**
 * @param {{
 *   isOpen: boolean;
 *   productId: string;
 *   productName?: string;
 *   onClose: () => void;
 *   onSaved?: () => void;
 * }} props
 */
export function InstallmentProgramModal({
  isOpen,
  productId,
  productName = "",
  onClose,
  onSaved,
}) {
  const { upsertProgramMutation } = useInstallmentMutations();
  const [isEnabled, setIsEnabled] = useState(true);
  const [plans, setPlans] = useState([{ ...EMPTY_PLAN }]);
  const isSubmitting = upsertProgramMutation.isPending;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));

  const programQuery = useProductInstallmentProgramQuery({
    productId,
    enabled: isOpen && Boolean(productId),
  });
  const isLoading = programQuery.isLoading;

  useScrollLock(isOpen);
  useDialogFocusTrap(panelRef, {
    active: isOpen,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      const topLayer = getTopModalFocusLayer();
      if (!topLayer || topLayer.container !== panelRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !productId || programQuery.isLoading) {
      return undefined;
    }

    setError("");
    setSuccess("");

    const program = programQuery.data;
    if (program) {
      setIsEnabled(program.isEnabled);
      setPlans(
        program.plans.length > 0
          ? program.plans.map((plan) => ({
              title: plan.title,
              monthsCount: plan.monthsCount,
              monthlyAmountRub: plan.monthlyAmountRub,
              firstPaymentRequiredNow: plan.firstPaymentRequiredNow !== false,
            }))
          : [{ ...EMPTY_PLAN }],
      );
      return undefined;
    }

    setIsEnabled(true);
    setPlans([{ ...EMPTY_PLAN }]);
    return undefined;
  }, [isOpen, productId, programQuery.data, programQuery.isLoading]);

  useEffect(() => {
    if (programQuery.isError) {
      setError(
        programQuery.error instanceof Error
          ? programQuery.error.message
          : INSTALLMENT_UI.ERROR_GENERIC,
      );
    }
  }, [programQuery.error, programQuery.isError]);

  if (!isOpen) return null;

  const updatePlan = (index, patch) => {
    setPlans((prev) =>
      prev.map((plan, planIndex) =>
        planIndex === index ? { ...plan, ...patch } : plan,
      ),
    );
  };

  const addPlan = () => {
    if (plans.length >= INSTALLMENT_PLANS_MAX) return;
    setPlans((prev) => [...prev, { ...EMPTY_PLAN }]);
  };

  const removePlan = (index) => {
    if (plans.length <= 1) return;
    setPlans((prev) => prev.filter((_, planIndex) => planIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await upsertProgramMutation.mutateAsync({
        productId,
        body: {
          isEnabled,
          plans: plans.map((plan) => ({
            title: plan.title.trim(),
            monthsCount: Number(plan.monthsCount),
            monthlyAmountRub: Number(plan.monthlyAmountRub),
            firstPaymentRequiredNow: plan.firstPaymentRequiredNow,
          })),
        },
      });
      setSuccess(INSTALLMENT_UI.PROGRAM_MODAL_SUCCESS);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  };

  return createPortal(
    <div className="installment-program-modal__backdrop" role="presentation">
      <div
        ref={panelRef}
        className="installment-program-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="installment-program-modal-title"
      >
        <header className="installment-program-modal__header">
          <h2
            id="installment-program-modal-title"
            className="installment-program-modal__title"
          >
            {INSTALLMENT_UI.PROGRAM_MODAL_TITLE}
            {productName ? `: ${productName}` : ""}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="installment-program-modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </header>

        {isLoading ? (
          <p className="installment-program-modal__loading">
            {INSTALLMENT_UI.ACTION_PENDING}
          </p>
        ) : (
          <form className="installment-program-modal__form" onSubmit={handleSubmit}>
            <div className="installment-program-modal__body">
              <label className="installment-program-modal__toggle">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(event) => setIsEnabled(event.target.checked)}
                  disabled={isSubmitting}
                />
                <span>{INSTALLMENT_UI.PROGRAM_MODAL_ENABLED}</span>
              </label>

              <div className="installment-program-modal__plans">
                {plans.map((plan, index) => {
                  const planTotalRub =
                    Number(plan.monthsCount) * Number(plan.monthlyAmountRub);

                  return (
                    <fieldset key={index} className="installment-program-modal__plan">
                      <div className="installment-program-modal__plan-head">
                        <legend className="installment-program-modal__plan-name">
                          {INSTALLMENT_UI.PROGRAM_MODAL_PLAN_NUMBER(index + 1)}
                        </legend>
                        {plans.length > 1 ? (
                          <button
                            type="button"
                            className="installment-program-modal__plan-remove"
                            disabled={isSubmitting}
                            onClick={() => removePlan(index)}
                          >
                            {INSTALLMENT_UI.PROGRAM_MODAL_REMOVE_PLAN}
                          </button>
                        ) : null}
                      </div>

                      <div className="installment-program-modal__plan-body">
                        <label className="installment-program-modal__field">
                          <span className="installment-program-modal__label">
                            {INSTALLMENT_UI.PROGRAM_MODAL_PLAN_TITLE}
                          </span>
                          <input
                            type="text"
                            value={plan.title}
                            onChange={(event) =>
                              updatePlan(index, { title: event.target.value })
                            }
                            disabled={isSubmitting}
                            required
                          />
                        </label>

                        <div className="installment-program-modal__row">
                          <label className="installment-program-modal__field">
                            <span className="installment-program-modal__label">
                              {INSTALLMENT_UI.PROGRAM_MODAL_MONTHS}
                            </span>
                            <input
                              type="number"
                              min={INSTALLMENT_MONTHS_MIN}
                              max={INSTALLMENT_MONTHS_MAX}
                              value={plan.monthsCount}
                              onChange={(event) =>
                                updatePlan(index, {
                                  monthsCount:
                                    Number(event.target.value) ||
                                    INSTALLMENT_MONTHS_MIN,
                                })
                              }
                              disabled={isSubmitting}
                              required
                            />
                          </label>
                          <label className="installment-program-modal__field">
                            <span className="installment-program-modal__label">
                              {INSTALLMENT_UI.PROGRAM_MODAL_MONTHLY}
                            </span>
                            <input
                              type="number"
                              min={INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB}
                              value={plan.monthlyAmountRub}
                              onChange={(event) =>
                                updatePlan(index, {
                                  monthlyAmountRub:
                                    Number(event.target.value) ||
                                    INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
                                })
                              }
                              disabled={isSubmitting}
                              required
                            />
                          </label>
                        </div>

                        <p className="installment-program-modal__plan-total">
                          {INSTALLMENT_UI.PROGRAM_MODAL_PLAN_TOTAL(
                            formatPriceRub(planTotalRub),
                          )}
                        </p>

                        <label className="installment-program-modal__checkbox">
                          <input
                            type="checkbox"
                            checked={plan.firstPaymentRequiredNow}
                            onChange={(event) =>
                              updatePlan(index, {
                                firstPaymentRequiredNow: event.target.checked,
                              })
                            }
                            disabled={isSubmitting}
                          />
                          <span>{INSTALLMENT_UI.PROGRAM_MODAL_FIRST_NOW}</span>
                        </label>
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            </div>

            <footer className="installment-program-modal__footer">
              {plans.length < INSTALLMENT_PLANS_MAX ? (
                <button
                  type="button"
                  className="installment-program-modal__btn installment-program-modal__btn_add"
                  disabled={isSubmitting}
                  onClick={addPlan}
                >
                  {INSTALLMENT_UI.PROGRAM_MODAL_ADD_PLAN}
                </button>
              ) : (
                <p className="installment-program-modal__max-hint">
                  {INSTALLMENT_UI.PROGRAM_MODAL_MAX_PLANS(INSTALLMENT_PLANS_MAX)}
                </p>
              )}

              <div className="installment-program-modal__footer-actions">
                <button
                  type="submit"
                  className="installment-program-modal__btn installment-program-modal__btn_primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? INSTALLMENT_UI.PROGRAM_MODAL_SAVING
                    : INSTALLMENT_UI.PROGRAM_MODAL_SAVE}
                </button>
              </div>
            </footer>

            {error || success ? (
              <div className="installment-program-modal__feedback">
                {error ? (
                  <p className="installment-program-modal__error" role="alert">
                    {error}
                  </p>
                ) : null}
                {success ? (
                  <p className="installment-program-modal__success" role="status">
                    {success}
                  </p>
                ) : null}
              </div>
            ) : null}
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
