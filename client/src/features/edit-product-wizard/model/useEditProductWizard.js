import { useCallback, useEffect, useState } from "react";

import { resolveProductWizardStepIds } from "../../create-product-wizard/lib/createProductWizardSteps.js";
import { validateEditProductWizardStep } from "../lib/validateEditProductWizardStep.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   form: Record<string, unknown>;
 * }} params
 */
export function useEditProductWizard({ isOpen, form }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState("");

  const stepIds = resolveProductWizardStepIds(form.categoryDealType);
  const stepCount = stepIds.length;
  const stepId = stepIds[stepIndex] ?? stepIds[0];

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setStepError("");
    }
  }, [isOpen]);

  const validateCurrentStep = useCallback(() => {
    const message = validateEditProductWizardStep(stepId, form);
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
    stepIds,
    stepError,
    goNext,
    goBack,
    goToStep,
    validateCurrentStep,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === stepCount - 1,
  };
}
