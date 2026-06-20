import { resolveCreateProductWizardStepCopy } from "../../create-product-wizard/lib/resolveCreateProductWizardStepCopy.js";

/** @param {string} stepId */
export function resolveEditProductWizardStepCopy(stepId) {
  return resolveCreateProductWizardStepCopy(
    /** @type {import('../../create-product-wizard/lib/createProductWizardSteps.js').CreateProductWizardStepId} */ (
      stepId
    ),
  );
}
