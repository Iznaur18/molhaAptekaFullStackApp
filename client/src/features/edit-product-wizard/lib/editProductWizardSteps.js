/** @typedef {'basic' | 'media' | 'category' | 'commerce'} EditProductWizardStepId */

/** @type {readonly EditProductWizardStepId[]} */
export const EDIT_PRODUCT_WIZARD_STEP_IDS = [
  "basic",
  "media",
  "category",
  "commerce",
];

/** @param {number} index */
export const resolveEditProductWizardStepId = (index) =>
  EDIT_PRODUCT_WIZARD_STEP_IDS[index] ?? EDIT_PRODUCT_WIZARD_STEP_IDS[0];
