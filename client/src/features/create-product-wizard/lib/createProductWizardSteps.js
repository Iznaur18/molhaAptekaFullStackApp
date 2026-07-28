/** @typedef {'basic' | 'originality' | 'media' | 'category' | 'pickup' | 'commerce' | 'returns' | 'review'} CreateProductWizardStepId */

/** @type {readonly CreateProductWizardStepId[]} */
export const CREATE_PRODUCT_WIZARD_STEP_IDS = [
  "basic",
  "originality",
  "media",
  "category",
  "pickup",
  "commerce",
  "returns",
  "review",
];

/** @param {CreateProductWizardStepId} stepId */
export const resolveCreateProductWizardStepIndex = (stepId) =>
  CREATE_PRODUCT_WIZARD_STEP_IDS.indexOf(stepId);

/** @param {number} index */
export const resolveCreateProductWizardStepId = (index) =>
  CREATE_PRODUCT_WIZARD_STEP_IDS[index] ?? CREATE_PRODUCT_WIZARD_STEP_IDS[0];

export const CREATE_PRODUCT_WIZARD_STEP_COUNT = CREATE_PRODUCT_WIZARD_STEP_IDS.length;
