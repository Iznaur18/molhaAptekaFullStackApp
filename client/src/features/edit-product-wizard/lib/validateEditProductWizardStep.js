import { prepareCreateProductSubmit } from "../../../entities/product/lib/prepareCreateProductSubmit.js";
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
  if (stepId === "review") {
    const prepared = prepareCreateProductSubmit({
      form,
      isEdit: true,
      showCatalogAvailabilityToggle: false,
      sellerPointsMaxPerUnit: context.sellerPointsMaxPerUnit,
      sellerCatalogCommitted: context.sellerCatalogCommitted,
    });
    return prepared.ok ? null : prepared.message;
  }

  return validateCreateProductWizardStep(stepId, form, context);
}
