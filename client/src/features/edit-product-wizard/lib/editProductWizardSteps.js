/** @typedef {import('../../create-product-wizard/lib/createProductWizardSteps.js').CreateProductWizardStepId} EditProductWizardStepId */

import { CREATE_PRODUCT_WIZARD_STEP_IDS } from "../../create-product-wizard/lib/createProductWizardSteps.js";

/**
 * Паритет с create: те же шаги (включая pickup). Manage (аукцион/рассрочка) — вне wizard.
 * @type {readonly EditProductWizardStepId[]}
 */
export const EDIT_PRODUCT_WIZARD_STEP_IDS = CREATE_PRODUCT_WIZARD_STEP_IDS;

export const EDIT_PRODUCT_WIZARD_STEP_COUNT = EDIT_PRODUCT_WIZARD_STEP_IDS.length;

/** @param {number} index */
export const resolveEditProductWizardStepId = (index) =>
  EDIT_PRODUCT_WIZARD_STEP_IDS[index] ?? EDIT_PRODUCT_WIZARD_STEP_IDS[0];
