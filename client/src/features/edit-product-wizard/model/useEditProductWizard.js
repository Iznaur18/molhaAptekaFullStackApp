import { useCallback, useEffect, useState } from "react";

import {
  EDIT_PRODUCT_WIZARD_STEP_COUNT,
  EDIT_PRODUCT_WIZARD_STEP_IDS,
  resolveEditProductWizardStepId,
} from "../lib/editProductWizardSteps.js";
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

  const stepIds = EDIT_PRODUCT_WIZARD_STEP_IDS;
  const stepId = resolveEditProductWizardStepId(stepIndex);

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

    setStepIndex((current) => Math.min(current + 1, EDIT_PRODUCT_WIZARD_STEP_COUNT - 1));
    setStepError("");
    return true;
  }, [validateCurrentStep]);

  const goBack = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0));
    setStepError("");
  }, []);

  const goToStep = useCallback((index) => {
    const safeIndex = Math.max(0, Math.min(index, EDIT_PRODUCT_WIZARD_STEP_COUNT - 1));
    setStepIndex(safeIndex);
    setStepError("");
  }, []);

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
    isLastStep: stepIndex === EDIT_PRODUCT_WIZARD_STEP_COUNT - 1,
  };
}
