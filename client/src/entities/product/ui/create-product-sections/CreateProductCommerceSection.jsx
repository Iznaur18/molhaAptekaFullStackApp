import { INTEGER_INPUT_FIELD_PROPS } from "../../../../shared/lib/numericInput.js";
import { PRODUCT_STOCK_QUANTITY_MAX } from "../../model/productStockConstants.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../../lib/productFieldRegistry.js";
import { FormFieldLabel } from "../../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   isSubmitting: boolean;
 *   handleChange: import('react').ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
 *   handleAvailableChange: import('react').ChangeEventHandler<HTMLInputElement>;
 *   discountPreviewPercent: number | null;
 *   loyaltyFieldDisabled: boolean;
 *   sellerLoyaltyBudget: { available: number; catalogCommitted: number };
 *   sellerPointsMaxPerUnit: number;
 *   showCatalogAvailabilityToggle?: boolean;
 *   isEdit?: boolean;
 *   className?: string;
 * }} props
 */
export function CreateProductCommerceSection({
  form,
  isSubmitting,
  handleChange,
  handleAvailableChange,
  discountPreviewPercent,
  loyaltyFieldDisabled,
  sellerLoyaltyBudget,
  sellerPointsMaxPerUnit,
  showCatalogAvailabilityToggle = true,
  isEdit = false,
  className = "",
}) {
  return (
    <div className={["create-product-section", className].filter(Boolean).join(" ")}>
      <p className="create-product-section__lead">{CREATE_PRODUCT_MODAL_UI.WIZARD_COMMERCE_LEAD}</p>
      <div className="create-product-section__price-grid">
        <label className="create-product-section__label">
          <FormFieldLabel required>{getProductFieldEditLabel("productPrice")}</FormFieldLabel>
          <input
            {...INTEGER_INPUT_FIELD_PROPS}
            className="create-product-section__input create-product-section__input_price"
            name="productPrice"
            value={String(form.productPrice ?? "")}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="0"
          />
        </label>
        <label className="create-product-section__label">
          <FormFieldLabel>{getProductFieldEditLabel("productOldPrice")}</FormFieldLabel>
          <input
            {...INTEGER_INPUT_FIELD_PROPS}
            className="create-product-section__input create-product-section__input_price"
            name="productOldPrice"
            value={String(form.productOldPrice ?? "")}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="0"
          />
        </label>
      </div>
      {discountPreviewPercent != null ? (
        <p className="create-product-section__discount-preview">
          {CREATE_PRODUCT_MODAL_UI.LABEL_DISCOUNT_PREVIEW}: −{discountPreviewPercent}%
        </p>
      ) : null}
      {showCatalogAvailabilityToggle ? (
        <label className="create-product-section__check">
          <input
            type="checkbox"
            checked={form.productIsAvailable === true}
            onChange={handleAvailableChange}
            disabled={isSubmitting}
          />
          {getProductFieldEditLabel("productIsAvailable")}
        </label>
      ) : null}
      {form.productIsAvailable || isEdit ? (
        <label className="create-product-section__label">
          <FormFieldLabel
            required={form.productIsAvailable === true || !showCatalogAvailabilityToggle}
          >
            {getProductFieldEditLabel("productStockQuantity")}
          </FormFieldLabel>
          <input
            {...INTEGER_INPUT_FIELD_PROPS}
            className="create-product-section__input"
            name="productStockQuantity"
            value={String(form.productStockQuantity ?? "")}
            onChange={handleChange}
            maxLength={String(PRODUCT_STOCK_QUANTITY_MAX).length}
            disabled={isSubmitting}
          />
        </label>
      ) : null}
      <label className="create-product-section__label">
        <FormFieldLabel>{getProductFieldEditLabel("loyaltyPointsPerUnit")}</FormFieldLabel>
        <input
          {...INTEGER_INPUT_FIELD_PROPS}
          className="create-product-section__input"
          name="loyaltyPointsPerUnit"
          value={String(form.loyaltyPointsPerUnit ?? "")}
          onChange={handleChange}
          disabled={isSubmitting || loyaltyFieldDisabled}
          maxLength={8}
        />
        <p className="create-product-section__hint">
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
  );
}
