import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/** @param {import('../lib/createProductWizardSteps.js').CreateProductWizardStepId} stepId */
export function resolveCreateProductWizardStepCopy(stepId) {
  switch (stepId) {
    case "basic":
      return {
        title: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_BASIC_TITLE,
        subtitle: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_BASIC_SUBTITLE,
        shortLabel: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_BASIC,
      };
    case "originality":
      return {
        title: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_ORIGINALITY_TITLE,
        subtitle: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_ORIGINALITY_SUBTITLE,
        shortLabel: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_ORIGINALITY,
      };
    case "media":
      return {
        title: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_MEDIA_TITLE,
        subtitle: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_MEDIA_SUBTITLE,
        shortLabel: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_MEDIA,
      };
    case "category":
      return {
        title: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_CATEGORY_TITLE,
        subtitle: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_CATEGORY_SUBTITLE,
        shortLabel: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_CATEGORY,
      };
    case "commerce":
      return {
        title: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_COMMERCE_TITLE,
        subtitle: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_COMMERCE_SUBTITLE,
        shortLabel: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_COMMERCE,
      };
    case "returns":
      return {
        title: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_RETURNS_TITLE,
        subtitle: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_RETURNS_SUBTITLE,
        shortLabel: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_RETURNS,
      };
    case "review":
      return {
        title: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_REVIEW_TITLE,
        subtitle: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_REVIEW_SUBTITLE,
        shortLabel: CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_REVIEW,
      };
    default:
      return {
        title: CREATE_PRODUCT_MODAL_UI.TITLE,
        subtitle: "",
        shortLabel: "",
      };
  }
}
