import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EDIT_PRODUCT_WIZARD_STEP_IDS,
  resolveEditProductWizardStepId,
} from "../lib/editProductWizardSteps.js";
import { validateEditProductWizardStep } from "../lib/validateEditProductWizardStep.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   form: Record<string, unknown>;
 *   sellerPointsMaxPerUnit: number;
 *   sellerCatalogCommitted: number;
 * }} params
 */
export function useEditProductWizard({
  isOpen,
  form,
  sellerPointsMaxPerUnit,
  sellerCatalogCommitted,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState("");

  const stepIds = EDIT_PRODUCT_WIZARD_STEP_IDS;
  const stepId = resolveEditProductWizardStepId(stepIndex);
  const validationContext = useMemo(
    () => ({
      sellerPointsMaxPerUnit,
      sellerCatalogCommitted,
    }),
    [sellerCatalogCommitted, sellerPointsMaxPerUnit],
  );

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setStepError("");
    }
  }, [isOpen]);

  const validateCurrentStep = useCallback(() => {
    const message = validateEditProductWizardStep(stepId, form, validationContext);
    setStepError(message ?? "");
    return message == null;
  }, [form, stepId, validationContext]);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return false;
    }

    setStepIndex((current) => Math.min(current + 1, stepIds.length - 1));
    setStepError("");
    return true;
  }, [stepIds.length, validateCurrentStep]);

  const goBack = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0));
    setStepError("");
  }, []);

  return {
    stepId,
    stepIndex,
    stepIds,
    stepError,
    goNext,
    goBack,
    validateCurrentStep,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === stepIds.length - 1,
  };
}
