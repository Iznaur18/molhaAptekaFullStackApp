import { useCreateProductForm } from "../model/useCreateProductForm.js";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import { CreateProductBasicSection } from "./create-product-sections/CreateProductBasicSection.jsx";
import { CreateProductCategorySection } from "./create-product-sections/CreateProductCategorySection.jsx";
import { CreateProductCommerceSection } from "./create-product-sections/CreateProductCommerceSection.jsx";
import { CreateProductMediaSection } from "./create-product-sections/CreateProductMediaSection.jsx";
import "./create-product-sections/CreateProductSections.css";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { ProductEditManageSection } from "./ProductEditManageSection.jsx";
import { InstallmentProgramModal } from "../../installment/ui/InstallmentProgramModal.jsx";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./CreateProductModal.css";

const EDIT_PRODUCT_FORM_ID = "edit-product-form";

/**
 * @param {Omit<import('./CreateProductModal.jsx').CreateProductModalProps, 'mode'>} props
 */
export function EditProductModal({
  isOpen,
  onClose,
  onSuccess,
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
  sellerProducts = [],
  productToEdit = null,
  manageProduct = null,
  onDeleteProduct,
  onSetProductAvailability,
  onSetProductAuction,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  manageErrorMessage = "",
  canManageEdit = true,
  canManageDelete = true,
  canManageToggleVisibility = true,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
}) {
  const {
    form,
    setForm,
    status,
    isInstallmentProgramOpen,
    setIsInstallmentProgramOpen,
    showManageSection,
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
    manageProduct,
    onDeleteProduct,
    sellerLoyaltyPointsBalance,
    sellerLoyaltyPointsReserved,
    sellerProducts,
  });

  if (!isOpen) return null;

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

  return (
    <>
      <ProductModalShell
        isOpen={isOpen}
        onClose={handleClose}
        title={CREATE_PRODUCT_MODAL_UI.TITLE_EDIT}
        titleId="create-product-modal-title"
        ariaLabel={CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG_EDIT}
        size="lg"
        panelClassName="create-product-modal__panel"
        bodyClassName="create-product-modal__body"
        footerClassName="create-product-modal__footer"
        footer={
          <div className="create-product-modal__footer-actions">
            <button
              type="button"
              className="create-product-modal__cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {CREATE_PRODUCT_MODAL_UI.CANCEL}
            </button>
            <button
              type="button"
              className="create-product-modal__submit"
              disabled={isSubmitting}
              onClick={(event) => {
                void handleSubmit(event);
              }}
            >
              {isSubmitting
                ? CREATE_PRODUCT_MODAL_UI.SUBMIT_EDIT_LOADING
                : CREATE_PRODUCT_MODAL_UI.SUBMIT_EDIT_IDLE}
            </button>
          </div>
        }
      >
        <form
          id={EDIT_PRODUCT_FORM_ID}
          className="create-product-modal__form"
          noValidate
          onSubmit={handleSubmit}
        >
          <section className="create-product-modal__section" aria-labelledby="edit-product-basic">
            <h3 id="edit-product-basic" className="create-product-modal__section-title">
              {CREATE_PRODUCT_MODAL_UI.SECTION_BASIC}
            </h3>
            <CreateProductBasicSection {...sectionProps} />
          </section>

          <section className="create-product-modal__section" aria-labelledby="edit-product-media">
            <h3 id="edit-product-media" className="create-product-modal__section-title">
              {CREATE_PRODUCT_MODAL_UI.SECTION_MEDIA}
            </h3>
            <CreateProductMediaSection {...sectionProps} />
          </section>

          <section className="create-product-modal__section" aria-labelledby="edit-product-category">
            <h3 id="edit-product-category" className="create-product-modal__section-title">
              {CREATE_PRODUCT_MODAL_UI.SECTION_COMMERCE}
            </h3>
            <CreateProductCategorySection {...sectionProps} />
            <CreateProductCommerceSection
              {...sectionProps}
              showCatalogAvailabilityToggle={showCatalogAvailabilityToggle}
              isEdit
            />
          </section>

          {showManageSection && manageProduct ? (
            <section
              className="create-product-modal__section create-product-modal__section_manage"
              aria-labelledby="create-product-section-manage"
            >
              <h3
                id="create-product-section-manage"
                className="create-product-modal__section-title"
              >
                {CREATE_PRODUCT_MODAL_UI.MANAGE_SECTION_TITLE}
              </h3>
              <ProductEditManageSection
                product={manageProduct}
                onDelete={onDeleteProduct}
                onSetAvailability={onSetProductAvailability}
                onSetAuction={onSetProductAuction}
                isDeletePending={isDeletePending}
                isAvailabilityTogglePending={isAvailabilityTogglePending}
                isAuctionTogglePending={isAuctionTogglePending}
                errorMessage={manageErrorMessage}
                canEdit={canManageEdit}
                canDelete={canManageDelete}
                canToggleVisibility={canManageToggleVisibility}
                sellerRaffleActive={sellerRaffleActive}
                onToggleRaffleParticipation={onToggleRaffleParticipation}
                isRaffleParticipationPending={isRaffleParticipationPending}
                disabled={isSubmitting}
                onOpenInstallmentProgram={() => setIsInstallmentProgramOpen(true)}
                canOpenInstallmentProgram={
                  manageProduct.productModerationStatus === PRODUCT_MODERATION_APPROVED
                }
              />
            </section>
          ) : null}

          {status.kind === "error" ? (
            <p
              className="create-product-modal__message create-product-modal__message_error"
              role="alert"
            >
              {status.message}
            </p>
          ) : null}
        </form>
      </ProductModalShell>
      {manageProduct?._id != null ? (
        <InstallmentProgramModal
          isOpen={isInstallmentProgramOpen}
          productId={String(manageProduct._id)}
          productName={manageProduct.productName}
          onClose={() => setIsInstallmentProgramOpen(false)}
          onSaved={() => {
            if (manageProduct?._id != null) {
              onSuccess?.(manageProduct);
            }
          }}
        />
      ) : null}
    </>
  );
}
