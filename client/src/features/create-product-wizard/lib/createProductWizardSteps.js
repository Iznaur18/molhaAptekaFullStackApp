import { isCartDealType } from "@molha/api-contract";

/** @typedef {'category' | 'basic' | 'originality' | 'media' | 'pickup' | 'commerce' | 'returns' | 'review'} CreateProductWizardStepId */

/** @type {readonly CreateProductWizardStepId[]} */
export const CREATE_PRODUCT_WIZARD_STEP_IDS = [
  "category",
  "basic",
  "originality",
  "media",
  "pickup",
  "commerce",
  "returns",
  "review",
];

/**
 * Осмотр и услуга — не товар на перепродажу: шаг «Статус товара» им не нужен.
 *
 * @type {readonly CreateProductWizardStepId[]}
 */
const NON_CART_WIZARD_STEP_IDS = CREATE_PRODUCT_WIZARD_STEP_IDS.filter(
  (stepId) => stepId !== "originality",
);

/**
 * Шаги мастера зависят от типа сделки выбранной категории.
 *
 * @param {unknown} dealType
 * @returns {readonly CreateProductWizardStepId[]}
 */
export const resolveProductWizardStepIds = (dealType) =>
  isCartDealType(dealType) ? CREATE_PRODUCT_WIZARD_STEP_IDS : NON_CART_WIZARD_STEP_IDS;

/** @param {CreateProductWizardStepId} stepId */
export const resolveCreateProductWizardStepIndex = (stepId) =>
  CREATE_PRODUCT_WIZARD_STEP_IDS.indexOf(stepId);

/** @param {number} index */
export const resolveCreateProductWizardStepId = (index) =>
  CREATE_PRODUCT_WIZARD_STEP_IDS[index] ?? CREATE_PRODUCT_WIZARD_STEP_IDS[0];

export const CREATE_PRODUCT_WIZARD_STEP_COUNT = CREATE_PRODUCT_WIZARD_STEP_IDS.length;
