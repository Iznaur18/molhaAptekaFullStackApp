import { validateCreateProductWizardStep } from "../../create-product-wizard/lib/validateCreateProductWizardStep.js";

/**
 * @param {string} stepId
 * @param {Record<string, unknown>} form
 * @param {{
 *   sellerPointsMaxPerUnit: number;
 *   sellerCatalogCommitted: number;
 * }} context
 * @returns {string | null}
 */
export function validateEditProductWizardStep(stepId, form, context) {
  return validateCreateProductWizardStep(stepId, form, context);
}
