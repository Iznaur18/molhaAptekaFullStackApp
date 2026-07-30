import { useEffect } from "react";

import { useCreateProductForm } from "../../../entities/product/model/useCreateProductForm.js";
import { resolveCategoryDefaultCharacteristicRowsPatch } from "../../../entities/product/lib/resolveCategoryDefaultCharacteristicRowsPatch.js";
import { CreateProductBasicSection } from "../../../entities/product/ui/create-product-sections/CreateProductBasicSection.jsx";
import { CreateProductOriginalitySection } from "../../../entities/product/ui/create-product-sections/CreateProductOriginalitySection.jsx";
import { CreateProductCategorySection } from "../../../entities/product/ui/create-product-sections/CreateProductCategorySection.jsx";
import { CreateProductPickupSection } from "../../../entities/product/ui/create-product-sections/CreateProductPickupSection.jsx";
import { CreateProductCommerceSection } from "../../../entities/product/ui/create-product-sections/CreateProductCommerceSection.jsx";
import { CreateProductReturnsSection } from "../../../entities/product/ui/create-product-sections/CreateProductReturnsSection.jsx";
import { CreateProductWizardMediaStep } from "./CreateProductWizardMediaStep.jsx";
import { CreateProductReviewSection } from "../../../entities/product/ui/create-product-sections/CreateProductReviewSection.jsx";
import "../../../entities/product/ui/create-product-sections/CreateProductSections.css";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { useCreateProductWizard } from "../model/useCreateProductWizard.js";
import { ProductWizardProgress } from "../../../shared/ui/ProductWizardProgress/ProductWizardProgress.jsx";
import { ProductWizardStepHeadline } from "../../../shared/ui/ProductWizardProgress/ProductWizardStepHeadline.jsx";
import { resolveCreateProductWizardStepCopy } from "../lib/resolveCreateProductWizardStepCopy.js";

import "./CreateProductWizard.css";

const CREATE_PRODUCT_WIZARD_FORM_ID = "create-product-wizard-form";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   sellerLoyaltyPointsBalance?: number;
 *   sellerLoyaltyPointsReserved?: number;
 *   sellerProducts?: import('../../../entities/product/model/types.js').ProductFromApi[];
 * }} props
 */
export function CreateProductWizard({
  isOpen,
  onClose,
  onSuccess,
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
  sellerProducts = [],
}) {
  const {
    form,
    setForm,
    status,
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
    mode: "create",
    sellerLoyaltyPointsBalance,
    sellerLoyaltyPointsReserved,
    sellerProducts,
  });

  const wizard = useCreateProductWizard({
    isOpen,
    form,
    sellerPointsMaxPerUnit,
    sellerCatalogCommitted: sellerLoyaltyBudget.catalogCommitted,
  });

  useEffect(() => {
    if (!isOpen || wizard.stepId !== "basic") {
      return;
    }
    const patch = resolveCategoryDefaultCharacteristicRowsPatch(form);
    if (!patch) {
      return;
    }
    setForm((prev) => ({ ...prev, ...patch }));
  }, [form, isOpen, setForm, wizard.stepId]);

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

  const handleBack = () => {
    wizard.goBack();
  };

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

  const stepCopy = resolveCreateProductWizardStepCopy(wizard.stepId);
  const showStepHeadline = !["basic", "originality", "pickup", "commerce", "returns"].includes(
    wizard.stepId,
  );

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={CREATE_PRODUCT_MODAL_UI.TITLE}
      titleId="create-product-wizard-title"
      ariaLabel={CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG}
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
              onClick={handleBack}
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
            form={CREATE_PRODUCT_WIZARD_FORM_ID}
            className="create-product-wizard__primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? CREATE_PRODUCT_MODAL_UI.SUBMIT_LOADING
              : wizard.isLastStep
                ? CREATE_PRODUCT_MODAL_UI.WIZARD_SUBMIT
                : CREATE_PRODUCT_MODAL_UI.WIZARD_NEXT}
          </button>
        </div>
      }
    >
      <ProductWizardProgress
        stepIds={wizard.stepIds}
        stepIndex={wizard.stepIndex}
        resolveStepCopy={resolveCreateProductWizardStepCopy}
      />
      <form
        id={CREATE_PRODUCT_WIZARD_FORM_ID}
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
          {wizard.stepId === "category" ? <CreateProductCategorySection {...sectionProps} /> : null}
          {wizard.stepId === "pickup" ? (
            <CreateProductPickupSection
              form={form}
              setForm={setForm}
              isSubmitting={isSubmitting}
            />
          ) : null}
          {wizard.stepId === "commerce" ? <CreateProductCommerceSection {...sectionProps} /> : null}
          {wizard.stepId === "returns" ? <CreateProductReturnsSection {...sectionProps} /> : null}
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
