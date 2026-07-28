import { useCreateProductForm } from "../../../entities/product/model/useCreateProductForm.js";
import { CreateProductBasicSection } from "../../../entities/product/ui/create-product-sections/CreateProductBasicSection.jsx";
import { CreateProductOriginalitySection } from "../../../entities/product/ui/create-product-sections/CreateProductOriginalitySection.jsx";
import { CreateProductCategorySection } from "../../../entities/product/ui/create-product-sections/CreateProductCategorySection.jsx";
import { CreateProductPickupSection } from "../../../entities/product/ui/create-product-sections/CreateProductPickupSection.jsx";
import { CreateProductCommerceSection } from "../../../entities/product/ui/create-product-sections/CreateProductCommerceSection.jsx";
import { CreateProductReturnsSection } from "../../../entities/product/ui/create-product-sections/CreateProductReturnsSection.jsx";
import { CreateProductReviewSection } from "../../../entities/product/ui/create-product-sections/CreateProductReviewSection.jsx";
import "../../../entities/product/ui/create-product-sections/CreateProductSections.css";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { ProductWizardProgress } from "../../../shared/ui/ProductWizardProgress/ProductWizardProgress.jsx";
import { ProductWizardStepHeadline } from "../../../shared/ui/ProductWizardProgress/ProductWizardStepHeadline.jsx";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { CreateProductWizardMediaStep } from "../../create-product-wizard/ui/CreateProductWizardMediaStep.jsx";
import { resolveEditProductWizardStepCopy } from "../lib/resolveEditProductWizardStepCopy.js";
import { useEditProductWizard } from "../model/useEditProductWizard.js";

import "../../create-product-wizard/ui/CreateProductWizard.css";

const EDIT_PRODUCT_WIZARD_FORM_ID = "edit-product-wizard-form";

/**
 * Edit wizard = create steps 1:1 (returns + review), submit с «Проверка».
 * Manage вне wizard.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   sellerLoyaltyPointsBalance?: number;
 *   sellerLoyaltyPointsReserved?: number;
 *   sellerProducts?: import('../../../entities/product/model/types.js').ProductFromApi[];
 *   productToEdit?: import('../../../entities/product/model/types.js').ProductFromApi | null;
 * }} props
 */
export function EditProductWizard({
  isOpen,
  onClose,
  onSuccess,
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
  sellerProducts = [],
  productToEdit = null,
}) {
  const {
    form,
    setForm,
    status,
    showCatalogAvailabilityToggle,
    sellerLoyaltyBudget,
    sellerPointsMaxPerUnit,
    loyaltyFieldDisabled,
    isSubmitting,
    handleClose,
    handleSubmit,
    descriptionChars,
    discountPreviewPercent,
    handleChange,
    handleAvailableChange,
  } = useCreateProductForm({
    isOpen,
    onClose,
    onSuccess,
    mode: "edit",
    productToEdit,
    sellerLoyaltyPointsBalance,
    sellerLoyaltyPointsReserved,
    sellerProducts,
  });

  const wizard = useEditProductWizard({
    isOpen,
    form,
    sellerPointsMaxPerUnit,
    sellerCatalogCommitted: sellerLoyaltyBudget.catalogCommitted,
  });

  if (!isOpen) {
    return null;
  }

  const errorMessage =
    wizard.stepError || (status.kind === "error" ? status.message : "");

  const handlePrimaryAction = (event) => {
    event.preventDefault();

    if (wizard.isLastStep) {
      if (!wizard.validateCurrentStep()) {
        return;
      }
      void handleSubmit(event);
      return;
    }

    wizard.goNext();
  };

  const primaryLabel = isSubmitting
    ? CREATE_PRODUCT_MODAL_UI.SUBMIT_EDIT_LOADING
    : wizard.isLastStep
      ? CREATE_PRODUCT_MODAL_UI.SUBMIT_EDIT_IDLE
      : CREATE_PRODUCT_MODAL_UI.WIZARD_NEXT;

  const sectionProps = {
    form,
    setForm,
    isSubmitting,
    handleChange,
    descriptionChars,
    handleAvailableChange,
    discountPreviewPercent,
    loyaltyFieldDisabled,
    sellerLoyaltyBudget,
    sellerPointsMaxPerUnit,
  };

  const stepCopy = resolveEditProductWizardStepCopy(wizard.stepId);
  const showStepHeadline = !["basic", "originality", "pickup", "commerce", "returns"].includes(
    wizard.stepId,
  );

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={CREATE_PRODUCT_MODAL_UI.TITLE_EDIT}
      titleId="edit-product-wizard-title"
      ariaLabel={CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG_EDIT}
      size="lg"
      panelClassName="create-product-wizard__panel"
      bodyClassName="create-product-wizard__body"
      footerClassName="create-product-wizard__footer"
      footer={
        <div className="create-product-wizard__footer-actions">
          {!wizard.isFirstStep ? (
            <button
              type="button"
              className="create-product-wizard__back"
              onClick={wizard.goBack}
              disabled={isSubmitting}
            >
              {CREATE_PRODUCT_MODAL_UI.WIZARD_BACK}
            </button>
          ) : (
            <button
              type="button"
              className="create-product-wizard__back create-product-wizard__back_placeholder"
              disabled
              aria-hidden="true"
            >
              {CREATE_PRODUCT_MODAL_UI.WIZARD_BACK}
            </button>
          )}
          <button
            type="submit"
            form={EDIT_PRODUCT_WIZARD_FORM_ID}
            className="create-product-wizard__primary"
            disabled={isSubmitting}
          >
            {primaryLabel}
          </button>
        </div>
      }
    >
      <ProductWizardProgress
        stepIds={wizard.stepIds}
        stepIndex={wizard.stepIndex}
        resolveStepCopy={resolveEditProductWizardStepCopy}
        progressAria={CREATE_PRODUCT_MODAL_UI.EDIT_WIZARD_PROGRESS_ARIA}
      />
      <form
        id={EDIT_PRODUCT_WIZARD_FORM_ID}
        className="create-product-wizard__form"
        noValidate
        onSubmit={handlePrimaryAction}
      >
        <div key={wizard.stepId} className="create-product-wizard__step-panel">
          {showStepHeadline ? (
            <ProductWizardStepHeadline
              title={stepCopy.title}
              subtitle={stepCopy.subtitle}
            />
          ) : null}
          {wizard.stepId === "basic" ? <CreateProductBasicSection {...sectionProps} /> : null}
          {wizard.stepId === "originality" ? (
            <CreateProductOriginalitySection {...sectionProps} />
          ) : null}
          {wizard.stepId === "media" ? (
            <CreateProductWizardMediaStep
              form={form}
              setForm={setForm}
              isSubmitting={isSubmitting}
            />
          ) : null}
          {wizard.stepId === "category" ? (
            <CreateProductCategorySection {...sectionProps} />
          ) : null}
          {wizard.stepId === "pickup" ? (
            <CreateProductPickupSection
              form={form}
              setForm={setForm}
              isSubmitting={isSubmitting}
            />
          ) : null}
          {wizard.stepId === "commerce" ? (
            <CreateProductCommerceSection
              {...sectionProps}
              showCatalogAvailabilityToggle={showCatalogAvailabilityToggle}
              isEdit
            />
          ) : null}
          {wizard.stepId === "returns" ? (
            <CreateProductReturnsSection {...sectionProps} />
          ) : null}
          {wizard.stepId === "review" ? (
            <CreateProductReviewSection
              form={form}
              discountPreviewPercent={discountPreviewPercent}
              onEditStep={wizard.goToStep}
            />
          ) : null}
        </div>
        {errorMessage ? (
          <p className="create-product-wizard__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </ProductModalShell>
  );
}
