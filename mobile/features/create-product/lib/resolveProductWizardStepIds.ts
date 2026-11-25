import { isCartDealType } from "@molha/api-contract";

/** @see client `features/create-product-wizard/lib/createProductWizardSteps.js` */
export const CREATE_PRODUCT_WIZARD_STEP_IDS = [
  "category",
  "basic",
  "originality",
  "media",
  "pickup",
  "commerce",
  "returns",
  "review",
] as const;

export type CreateProductWizardStepId = (typeof CREATE_PRODUCT_WIZARD_STEP_IDS)[number];

const NON_CART_WIZARD_STEP_IDS = CREATE_PRODUCT_WIZARD_STEP_IDS.filter(
  (stepId) => stepId !== "originality",
);

/** Осмотр/услуга — без шага «Статус товара». */
export const resolveProductWizardStepIds = (
  dealType: unknown,
): readonly CreateProductWizardStepId[] =>
  isCartDealType(dealType) ? CREATE_PRODUCT_WIZARD_STEP_IDS : NON_CART_WIZARD_STEP_IDS;
