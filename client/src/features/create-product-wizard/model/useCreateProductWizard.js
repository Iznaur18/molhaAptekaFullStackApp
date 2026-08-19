import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CREATE_PRODUCT_WIZARD_STEP_COUNT,
  CREATE_PRODUCT_WIZARD_STEP_IDS,
  resolveCreateProductWizardStepId,
} from "../lib/createProductWizardSteps.js";
import { readCreateProductFormDraft } from "../../../entities/product/lib/createProductFormDraftStorage.js";
import { validateCreateProductWizardStep } from "../lib/validateCreateProductWizardStep.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   form: Record<string, unknown>;
 *   sellerPointsMaxPerUnit: number;
 *   sellerCatalogCommitted: number;
 *   draftEnabled?: boolean;
 * }} params
 */
export function useCreateProductWizard({
  isOpen,
  form,
  sellerPointsMaxPerUnit,
  sellerCatalogCommitted,
  draftEnabled = false,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState("");

  const stepId = resolveCreateProductWizardStepId(stepIndex);
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
      return;
    }
    // Возобновляем создание с того шага, на котором продавец прервался.
    const draft = draftEnabled ? readCreateProductFormDraft() : null;
    setStepIndex(
      draft
        ? Math.max(0, Math.min(draft.stepIndex, CREATE_PRODUCT_WIZARD_STEP_COUNT - 1))
        : 0,
    );
    setStepError("");
  }, [isOpen, draftEnabled]);

  const validateCurrentStep = useCallback(() => {
    const message = validateCreateProductWizardStep(stepId, form, validationContext);
    setStepError(message ?? "");
    return message == null;
  }, [form, stepId, validationContext]);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return false;
    }

    setStepIndex((current) => Math.min(current + 1, CREATE_PRODUCT_WIZARD_STEP_COUNT - 1));
    setStepError("");
    return true;
  }, [validateCurrentStep]);

  const goBack = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0));
    setStepError("");
  }, []);

  const goToStep = useCallback((index) => {
    const safeIndex = Math.max(0, Math.min(index, CREATE_PRODUCT_WIZARD_STEP_COUNT - 1));
    setStepIndex(safeIndex);
    setStepError("");
  }, []);

  return {
    stepId,
    stepIndex,
    stepCount: CREATE_PRODUCT_WIZARD_STEP_COUNT,
    stepIds: CREATE_PRODUCT_WIZARD_STEP_IDS,
    stepError,
    setStepError,
    goNext,
    goBack,
    goToStep,
    validateCurrentStep,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === CREATE_PRODUCT_WIZARD_STEP_COUNT - 1,
  };
}
