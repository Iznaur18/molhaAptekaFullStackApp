import { useCreateProductForm } from "../model/useCreateProductForm.js";
import {
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_DESCRIPTION_MIN_CHARS,
} from "../model/productConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import { PRODUCT_STOCK_QUANTITY_MAX } from "../model/productStockConstants.js";
import { CreateProductCategoryPicker } from "../../product-category-tree/ui/CreateProductCategoryPicker.jsx";
import { INTEGER_INPUT_FIELD_PROPS } from "../../../shared/lib/numericInput.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { ProductEditManageSection } from "./ProductEditManageSection.jsx";
import { InstallmentProgramModal } from "../../installment/ui/InstallmentProgramModal.jsx";
import { ProductImageUrlSortableList } from "./ProductImageUrlSortableList.jsx";
import { ProductPreviewVideoField } from "./ProductPreviewVideoField.jsx";
import { ProductCharacteristicsEditor } from "./ProductCharacteristicsEditor.jsx";
import {
  CREATE_PRODUCT_MODAL_UI,
  PRODUCT_PREVIEW_VIDEO_UI,
} from "../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../lib/productFieldRegistry.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { PRODUCT_SALE_CITY_MAX_LENGTH } from "../../address/model/constants.js";
import "./CreateProductModal.css";

const CREATE_PRODUCT_FORM_ID = "create-product-form";
const EDIT_PRODUCT_FORM_ID = "edit-product-form";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: (product: import('../model/types.js').ProductFromApi) => void;
 *   mode?: 'create' | 'edit';
 *   productToEdit?: import('../model/types.js').ProductFromApi | null;
 *   manageProduct?: import('../model/types.js').ProductFromApi | null;
 *   onDeleteProduct?: (productId: string) => void | Promise<void>;
 *   onSetProductAvailability?: (
 *     productId: string,
 *     productIsAvailable: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductAuction?: (
 *     productId: string,
 *     productAuctionEnabled: boolean,
 *   ) => void | Promise<void>;
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 *   manageErrorMessage?: string;
 *   canManageEdit?: boolean;
 *   canManageDelete?: boolean;
 *   canManageToggleVisibility?: boolean;
 *   sellerRaffleActive?: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import('../model/types.js').ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   isRaffleParticipationPending?: boolean;
 *   sellerLoyaltyPointsBalance?: number;
 *   sellerLoyaltyPointsReserved?: number;
 *   sellerProducts?: import('../model/types.js').ProductFromApi[];
 * }} props
 */
export function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
  sellerProducts = [],
  mode = "create",
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
    isEdit,
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
    mode,
    productToEdit,
    manageProduct,
    onDeleteProduct,
    sellerLoyaltyPointsBalance,
    sellerLoyaltyPointsReserved,
    sellerProducts,
  });

  if (!isOpen) return null;

  const dialogAria = isEdit
    ? CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG_EDIT
    : CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG;
  const title = isEdit
    ? CREATE_PRODUCT_MODAL_UI.TITLE_EDIT
    : CREATE_PRODUCT_MODAL_UI.TITLE;
  const submitIdle = isEdit
    ? CREATE_PRODUCT_MODAL_UI.SUBMIT_EDIT_IDLE
    : CREATE_PRODUCT_MODAL_UI.SUBMIT_IDLE;
  const submitLoading = isEdit
    ? CREATE_PRODUCT_MODAL_UI.SUBMIT_EDIT_LOADING
    : CREATE_PRODUCT_MODAL_UI.SUBMIT_LOADING;
  const formId = isEdit ? EDIT_PRODUCT_FORM_ID : CREATE_PRODUCT_FORM_ID;

  const handleSaveClick = (event) => {
    void handleSubmit(event);
  };

  return (
    <>
      <ProductModalShell
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        titleId="create-product-modal-title"
        ariaLabel={dialogAria}
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
              onClick={handleSaveClick}
            >
              {isSubmitting ? submitLoading : submitIdle}
            </button>
          </div>
        }
      >
        <form
          id={formId}
          className="create-product-modal__form"
          noValidate
          onSubmit={handleSubmit}
        >
          <section
            className="create-product-modal__section"
            aria-labelledby="create-product-section-basic"
          >
            <h3
              id="create-product-section-basic"
              className="create-product-modal__section-title"
            >
              {CREATE_PRODUCT_MODAL_UI.SECTION_BASIC}
            </h3>
            <div className="create-product-modal__section-body">
              <label className="create-product-modal__label">
                <FormFieldLabel required>
                  {getProductFieldEditLabel("productName")}
                </FormFieldLabel>
                <input
                  className="create-product-modal__input"
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  minLength={3}
                  autoComplete="off"
                  disabled={isSubmitting}
                />
              </label>
              <label className="create-product-modal__label">
                <FormFieldLabel required>
                  {getProductFieldEditLabel("productDescription")}
                </FormFieldLabel>
                <textarea
                  className="create-product-modal__textarea"
                  name="productDescription"
                  value={form.productDescription}
                  onChange={handleChange}
                  minLength={PRODUCT_DESCRIPTION_MIN_CHARS}
                  maxLength={PRODUCT_DESCRIPTION_MAX_CHARS}
                  disabled={isSubmitting}
                />
                <span
                  className={
                    descriptionChars > PRODUCT_DESCRIPTION_MAX_CHARS
                      ? "create-product-modal__char-meter create-product-modal__char-meter_overflow"
                      : "create-product-modal__char-meter"
                  }
                >
                  {CREATE_PRODUCT_MODAL_UI.CHARS_USED(
                    descriptionChars,
                    PRODUCT_DESCRIPTION_MAX_CHARS,
                  )}
                </span>
              </label>
              <ProductCharacteristicsEditor
                rows={form.productCharacteristicRows}
                onRowsChange={(productCharacteristicRows) =>
                  setForm((prev) => ({ ...prev, productCharacteristicRows }))
                }
                disabled={isSubmitting}
              />
            </div>
          </section>

          <section
            className="create-product-modal__section"
            aria-labelledby="create-product-section-media"
          >
            <h3
              id="create-product-section-media"
              className="create-product-modal__section-title"
            >
              {CREATE_PRODUCT_MODAL_UI.SECTION_MEDIA}
            </h3>
            <div className="create-product-modal__section-body">
              <ProductImageUrlSortableList
                rows={form.productImageRows}
                onRowsChange={(productImageRows) =>
                  setForm((prev) => ({ ...prev, productImageRows }))
                }
                disabled={isSubmitting}
              />
              <div className="create-product-modal__label">
                <FormFieldLabel>{PRODUCT_PREVIEW_VIDEO_UI.LABEL}</FormFieldLabel>
                <ProductPreviewVideoField
                  value={form.productPreviewVideoUrl}
                  onChange={(productPreviewVideoUrl) =>
                    setForm((prev) => ({ ...prev, productPreviewVideoUrl }))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </section>

          <section
            className="create-product-modal__section"
            aria-labelledby="create-product-section-commerce"
          >
            <h3
              id="create-product-section-commerce"
              className="create-product-modal__section-title"
            >
              {CREATE_PRODUCT_MODAL_UI.SECTION_COMMERCE}
            </h3>
            <div className="create-product-modal__section-body">
              <div className="create-product-modal__price-grid">
                <label className="create-product-modal__label">
                  <FormFieldLabel required>
                    {getProductFieldEditLabel("productPrice")}
                  </FormFieldLabel>
                  <input
                    {...INTEGER_INPUT_FIELD_PROPS}
                    className="create-product-modal__input create-product-modal__input_price"
                    name="productPrice"
                    value={form.productPrice}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </label>
                <label className="create-product-modal__label">
                  <FormFieldLabel>{getProductFieldEditLabel("productOldPrice")}</FormFieldLabel>
                  <input
                    {...INTEGER_INPUT_FIELD_PROPS}
                    className="create-product-modal__input create-product-modal__input_price"
                    name="productOldPrice"
                    value={form.productOldPrice}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              {discountPreviewPercent != null ? (
                <p className="create-product-modal__discount-preview">
                  {CREATE_PRODUCT_MODAL_UI.LABEL_DISCOUNT_PREVIEW}: −{discountPreviewPercent}%
                </p>
              ) : null}
              <CreateProductCategoryPicker
                value={{
                  productCategoryId: form.productCategoryId,
                  categoryBreadcrumbRu: form.categoryBreadcrumbRu,
                  productCategory: form.productCategory,
                }}
                disabled={isSubmitting}
                onChange={({
                  productCategoryId,
                  categoryBreadcrumbRu,
                  productCategory,
                }) =>
                  setForm((prev) => ({
                    ...prev,
                    productCategoryId,
                    categoryBreadcrumbRu,
                    productCategory,
                  }))
                }
              />
              <label className="create-product-modal__label">
                <FormFieldLabel>{CREATE_PRODUCT_MODAL_UI.LABEL_SALE_CITY}</FormFieldLabel>
                <input
                  type="text"
                  className="create-product-modal__input"
                  name="productSaleCity"
                  value={form.productSaleCity}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  maxLength={PRODUCT_SALE_CITY_MAX_LENGTH}
                  placeholder={CREATE_PRODUCT_MODAL_UI.PLACEHOLDER_SALE_CITY}
                />
                <span className="create-product-modal__hint">
                  {CREATE_PRODUCT_MODAL_UI.HINT_SALE_CITY}
                </span>
              </label>
              {showCatalogAvailabilityToggle ? (
                <label className="create-product-modal__check">
                  <input
                    type="checkbox"
                    checked={form.productIsAvailable}
                    onChange={handleAvailableChange}
                    disabled={isSubmitting}
                  />
                  {getProductFieldEditLabel("productIsAvailable")}
                </label>
              ) : null}
              {form.productIsAvailable || isEdit ? (
                <label className="create-product-modal__label">
                  <FormFieldLabel
                    required={form.productIsAvailable || !showCatalogAvailabilityToggle}
                  >
                    {getProductFieldEditLabel("productStockQuantity")}
                  </FormFieldLabel>
                  <input
                    {...INTEGER_INPUT_FIELD_PROPS}
                    className="create-product-modal__input"
                    name="productStockQuantity"
                    value={form.productStockQuantity}
                    onChange={handleChange}
                    maxLength={String(PRODUCT_STOCK_QUANTITY_MAX).length}
                    disabled={isSubmitting}
                  />
                </label>
              ) : null}
              <label className="create-product-modal__label">
                <FormFieldLabel>
                  {getProductFieldEditLabel("loyaltyPointsPerUnit")}
                </FormFieldLabel>
                <input
                  {...INTEGER_INPUT_FIELD_PROPS}
                  className="create-product-modal__input"
                  name="loyaltyPointsPerUnit"
                  value={form.loyaltyPointsPerUnit}
                  onChange={handleChange}
                  disabled={isSubmitting || loyaltyFieldDisabled}
                  maxLength={8}
                />
                <p className="create-product-modal__hint">
                  {loyaltyFieldDisabled
                    ? CREATE_PRODUCT_MODAL_UI.HINT_LOYALTY_POINTS_ZERO_BALANCE
                    : CREATE_PRODUCT_MODAL_UI.HINT_LOYALTY_POINTS_PER_UNIT(
                        sellerLoyaltyBudget.available,
                        sellerLoyaltyBudget.catalogCommitted,
                        sellerPointsMaxPerUnit,
                      )}
                </p>
              </label>
            </div>
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
              <div className="create-product-modal__section-body">
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
              </div>
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
