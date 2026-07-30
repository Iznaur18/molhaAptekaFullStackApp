import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useInstallmentMutations } from "../model/useInstallmentMutations.js";
import { useProductInstallmentProgramQuery } from "../model/useProductInstallmentProgramQuery.js";
import { validateInstallmentProgramPlans } from "../lib/validateInstallmentProgramPlans.js";
import {
  resolveInstallmentMonthlyFromMarkupPercent,
  resolveInstallmentPlanPriceSummary,
} from "../lib/resolveInstallmentPlanPriceSummary.js";
import {
  INSTALLMENT_MODERATION_APPROVED,
  INSTALLMENT_MODERATION_REJECTED,
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

const DEFAULT_PLAN_TITLE = "Стандарт";

const createEmptyPlan = (planNumber = 1) => ({
  title: planNumber <= 1 ? DEFAULT_PLAN_TITLE : `План ${planNumber}`,
  monthsCount: 3,
  monthlyAmountRub: INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
  firstPaymentRequiredNow: true,
  markupPercent: 0,
});

/**
 * @param {{
 *   isOpen: boolean;
 *   productId: string;
 *   productName?: string;
 *   productPrice?: number;
 *   onClose: () => void;
 *   onSaved?: (productPatch?: { productInstallmentEnabled?: boolean }) => void;
 * }} props
 */
export function InstallmentProgramModal({
  isOpen,
  productId,
  productName = "",
  productPrice = 0,
  onClose,
  onSaved,
}) {
  const { upsertProgramMutation } = useInstallmentMutations();
  const [plans, setPlans] = useState([createEmptyPlan()]);
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
  const programModerationStatus = programQuery.data?.moderationStatus;
  const moderationHint =
    programModerationStatus === INSTALLMENT_MODERATION_REJECTED
      ? INSTALLMENT_UI.PROGRAM_MODAL_REJECTED_HINT
      : programModerationStatus === INSTALLMENT_MODERATION_APPROVED &&
          programQuery.data?.isEnabled
        ? INSTALLMENT_UI.PROGRAM_MODAL_APPROVED_HINT
        : null;

  const buildDefaultPlan = useCallback(
    (planNumber) => {
      const base = createEmptyPlan(planNumber);
      return {
        ...base,
        markupPercent: 0,
        monthlyAmountRub: resolveInstallmentMonthlyFromMarkupPercent(
          productPrice,
          Number(base.monthsCount) || 0,
          0,
        ),
      };
    },
    [productPrice],
  );

  useScrollLock(isOpen);
  useDialogFocusTrap(panelRef, {
    active: isOpen,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    html.style.backgroundColor = "#fff";
    body.style.backgroundColor = "#fff";
    return () => {
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
    };
  }, [isOpen]);

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
    if (!isOpen) {
      setError("");
      setSuccess("");
      return undefined;
    }
    if (programQuery.isLoading) {
      return undefined;
    }

    const program = programQuery.data;
    if (program) {
      setPlans(
        program.plans.length > 0
          ? program.plans.map((plan) => {
              const monthsCount = Number(plan.monthsCount) || 3;
              const monthlyAmountRub =
                Number(plan.monthlyAmountRub) || INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB;
              return {
                title: plan.title ?? DEFAULT_PLAN_TITLE,
                monthsCount,
                monthlyAmountRub,
                firstPaymentRequiredNow: plan.firstPaymentRequiredNow !== false,
                markupPercent: resolveInstallmentPlanPriceSummary(
                  productPrice,
                  monthsCount,
                  monthlyAmountRub,
                ).markupPercent,
              };
            })
          : [buildDefaultPlan(1)],
      );
      return undefined;
    }

    setPlans([buildDefaultPlan(1)]);
    return undefined;
  }, [
    buildDefaultPlan,
    isOpen,
    productPrice,
    programQuery.data,
    programQuery.isLoading,
  ]);

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
    setPlans((prev) => [...prev, buildDefaultPlan(prev.length + 1)]);
  };

  const removePlan = (index) => {
    if (plans.length <= 1) return;
    setPlans((prev) => prev.filter((_, planIndex) => planIndex !== index));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const validation = validateInstallmentProgramPlans(plans);
    if (!validation.ok) {
      setError(validation.message);
      const field = document.getElementById(validation.focusFieldId);
      field?.focus();
      field?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }

    try {
      const existingPlans = programQuery.data?.plans;
      const isEnabled =
        Array.isArray(existingPlans) && existingPlans.length > 0
          ? programQuery.data.isEnabled === true
          : true;
      const result = await upsertProgramMutation.mutateAsync({
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
      const successMessage =
        typeof result?.message === "string" && result.message.trim()
          ? result.message.trim()
          : INSTALLMENT_UI.PROGRAM_MODAL_SUCCESS;
      setSuccess(successMessage);
      onSaved?.({ productInstallmentEnabled: isEnabled });
      const sentToModeration = successMessage.toLowerCase().includes("модерац");
      if (!sentToModeration) {
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    void handleSave();
  };

  return createPortal(
    <div className="installment-program-modal__backdrop" role="presentation">
      <div className="installment-program-modal__keyboard-bleed" aria-hidden="true" />
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
            aria-label={INSTALLMENT_UI.PROGRAM_MODAL_CLOSE}
          >
            ×
          </button>
        </header>

        {isLoading ? (
          <p className="installment-program-modal__loading">
            {INSTALLMENT_UI.ACTION_PENDING}
          </p>
        ) : (
          <form
            className="installment-program-modal__form"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="installment-program-modal__body">
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
              {moderationHint ? (
                <p className="installment-program-modal__info" role="status">
                  {moderationHint}
                </p>
              ) : null}

              <div className="installment-program-modal__plans">
                {plans.map((plan, index) => {
                  const monthsCount = Math.floor(Number(plan.monthsCount) || 0);
                  const monthlyAmountRub = Math.floor(
                    Number(plan.monthlyAmountRub) || 0,
                  );
                  const { planTotalRub, productPriceRub, markupRub } =
                    resolveInstallmentPlanPriceSummary(
                      productPrice,
                      monthsCount,
                      monthlyAmountRub,
                    );
                  const markupPercent = Math.max(
                    0,
                    Math.floor(Number(plan.markupPercent) || 0),
                  );

                  return (
                    <fieldset
                      key={index}
                      className="installment-program-modal__plan"
                    >
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
                            id={`installment-plan-${index}-title`}
                            type="text"
                            value={plan.title}
                            placeholder={
                              INSTALLMENT_UI.PROGRAM_MODAL_PLAN_TITLE_PLACEHOLDER
                            }
                            onChange={(event) =>
                              updatePlan(index, { title: event.target.value })
                            }
                            disabled={isSubmitting}
                            maxLength={80}
                            autoComplete="off"
                          />
                        </label>

                        <div className="installment-program-modal__row">
                          <label className="installment-program-modal__field">
                            <span className="installment-program-modal__label">
                              {INSTALLMENT_UI.PROGRAM_MODAL_MONTHS}
                            </span>
                            <input
                              id={`installment-plan-${index}-months`}
                              type="number"
                              inputMode="numeric"
                              min={INSTALLMENT_MONTHS_MIN}
                              max={INSTALLMENT_MONTHS_MAX}
                              value={plan.monthsCount}
                              onChange={(event) => {
                                const nextMonths =
                                  Number(event.target.value) || 0;
                                updatePlan(index, {
                                  monthsCount: nextMonths,
                                  monthlyAmountRub:
                                    resolveInstallmentMonthlyFromMarkupPercent(
                                      productPrice,
                                      nextMonths,
                                      markupPercent,
                                    ),
                                });
                              }}
                              disabled={isSubmitting}
                            />
                          </label>
                          <label className="installment-program-modal__field">
                            <span className="installment-program-modal__label">
                              {INSTALLMENT_UI.PROGRAM_MODAL_MARKUP_PERCENT}
                            </span>
                            <input
                              id={`installment-plan-${index}-markup`}
                              type="number"
                              inputMode="numeric"
                              min={0}
                              value={markupPercent}
                              onChange={(event) => {
                                const nextMarkupPercent = Math.max(
                                  0,
                                  Math.floor(Number(event.target.value) || 0),
                                );
                                updatePlan(index, {
                                  markupPercent: nextMarkupPercent,
                                  monthlyAmountRub:
                                    resolveInstallmentMonthlyFromMarkupPercent(
                                      productPrice,
                                      monthsCount,
                                      nextMarkupPercent,
                                    ),
                                });
                              }}
                              disabled={isSubmitting || productPriceRub <= 0}
                            />
                          </label>
                          <label className="installment-program-modal__field">
                            <span className="installment-program-modal__label">
                              {INSTALLMENT_UI.PROGRAM_MODAL_MONTHLY}
                            </span>
                            <input
                              id={`installment-plan-${index}-monthly`}
                              type="number"
                              inputMode="numeric"
                              min={INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB}
                              value={plan.monthlyAmountRub}
                              onChange={(event) => {
                                const nextMonthly =
                                  Number(event.target.value) || 0;
                                updatePlan(index, {
                                  monthlyAmountRub: nextMonthly,
                                  markupPercent:
                                    resolveInstallmentPlanPriceSummary(
                                      productPrice,
                                      monthsCount,
                                      nextMonthly,
                                    ).markupPercent,
                                });
                              }}
                              disabled={isSubmitting}
                            />
                          </label>
                        </div>

                        <div className="installment-program-modal__plan-total-block">
                          <p className="installment-program-modal__plan-total-meta">
                            {INSTALLMENT_UI.PROGRAM_MODAL_PLAN_ORIGINAL_PRICE(
                              formatPriceRub(productPriceRub),
                            )}
                          </p>
                          <p className="installment-program-modal__plan-total-meta">
                            {INSTALLMENT_UI.PROGRAM_MODAL_PLAN_MARKUP(
                              formatPriceRub(markupRub),
                              markupPercent,
                            )}
                          </p>
                          <p className="installment-program-modal__plan-total-main">
                            {INSTALLMENT_UI.PROGRAM_MODAL_PLAN_TOTAL(
                              formatPriceRub(planTotalRub),
                            )}
                          </p>
                        </div>

                        <label className="installment-program-modal__checkbox">
                          <input
                            type="checkbox"
                            checked={plan.firstPaymentRequiredNow !== false}
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
            </div>

            <footer className="installment-program-modal__footer">
              <button
                type="button"
                className="installment-program-modal__btn installment-program-modal__btn_primary installment-program-modal__btn_save"
                disabled={isSubmitting || isLoading}
                onClick={() => {
                  void handleSave();
                }}
              >
                {isSubmitting
                  ? INSTALLMENT_UI.PROGRAM_MODAL_SAVING
                  : INSTALLMENT_UI.PROGRAM_MODAL_SAVE}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
