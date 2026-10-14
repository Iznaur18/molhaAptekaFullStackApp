import { useCallback, useEffect, useState } from "react";

import { resolveProductWizardStepIds } from "../lib/createProductWizardSteps.js";
import { readCreateProductFormDraft } from "../../../entities/product/lib/createProductFormDraftStorage.js";
import { validateCreateProductWizardStep } from "../lib/validateCreateProductWizardStep.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   form: Record<string, unknown>;
 *   draftEnabled?: boolean;
 * }} params
 */
export function useCreateProductWizard({ isOpen, form, draftEnabled = false }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState("");

  const stepIds = resolveProductWizardStepIds(form.categoryDealType);
  const stepCount = stepIds.length;
  const stepId = stepIds[stepIndex] ?? stepIds[0];

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setStepError("");
      return;
    }
    // Возобновляем создание с того шага, на котором продавец прервался.
    const draft = draftEnabled ? readCreateProductFormDraft() : null;
    const draftStepCount = draft
      ? resolveProductWizardStepIds(draft.form?.categoryDealType).length
      : 0;
    setStepIndex(
      draft ? Math.max(0, Math.min(draft.stepIndex, draftStepCount - 1)) : 0,
    );
    setStepError("");
  }, [isOpen, draftEnabled]);

  const validateCurrentStep = useCallback(() => {
    const message = validateCreateProductWizardStep(stepId, form);
    setStepError(message ?? "");
    return message == null;
  }, [form, stepId]);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return false;
    }

    setStepIndex((current) => Math.min(current + 1, stepCount - 1));
    setStepError("");
    return true;
  }, [validateCurrentStep, stepCount]);

  const goBack = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0));
    setStepError("");
  }, []);

  const goToStep = useCallback(
    (index) => {
      const safeIndex = Math.max(0, Math.min(index, stepCount - 1));
      setStepIndex(safeIndex);
      setStepError("");
    },
    [stepCount],
  );

  return {
    stepId,
    stepIndex,
    stepCount,
    stepIds,
    stepError,
    setStepError,
    goNext,
    goBack,
    goToStep,
    validateCurrentStep,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === stepCount - 1,
  };
}
