import { prepareCreateProductSubmit } from "../../../entities/product/lib/prepareCreateProductSubmit.js";
import { validateCreateProductWizardStep } from "../../create-product-wizard/lib/validateCreateProductWizardStep.js";

/**
 * @param {string} stepId
 * @param {Record<string, unknown>} form
 * @returns {string | null}
 */
export function validateEditProductWizardStep(stepId, form) {
  if (stepId === "review") {
    const prepared = prepareCreateProductSubmit({
      form,
      isEdit: true,
      showCatalogAvailabilityToggle: false,
    });
    return prepared.ok ? null : prepared.message;
  }

  return validateCreateProductWizardStep(stepId, form);
}
