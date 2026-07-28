import {
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_DESCRIPTION_MIN_CHARS,
} from "../../model/productConstants.js";
import { ProductCharacteristicsEditor } from "../ProductCharacteristicsEditor.jsx";
import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../../lib/productFieldRegistry.js";
import { FormFieldLabel } from "../../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   setForm: import('react').Dispatch<import('react').SetStateAction<Record<string, unknown>>>;
 *   isSubmitting: boolean;
 *   handleChange: import('react').ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
 *   descriptionChars: number;
 *   className?: string;
 * }} props
 */
export function CreateProductBasicSection({
  form,
  setForm,
  isSubmitting,
  handleChange,
  descriptionChars,
  className = "",
}) {
  return (
    <div className={["create-product-section", className].filter(Boolean).join(" ")}>
      <label className="create-product-section__label">
        <FormFieldLabel required>{getProductFieldEditLabel("productName")}</FormFieldLabel>
        <input
          className="create-product-section__input"
          type="text"
          name="productName"
          value={String(form.productName ?? "")}
          onChange={handleChange}
          minLength={PRODUCT_NAME_MIN_LENGTH}
          maxLength={PRODUCT_NAME_MAX_LENGTH}
          autoComplete="off"
          disabled={isSubmitting}
          placeholder={CREATE_PRODUCT_MODAL_UI.WIZARD_PLACEHOLDER_NAME}
        />
      </label>

      <label className="create-product-section__label">
        <FormFieldLabel required>{getProductFieldEditLabel("productDescription")}</FormFieldLabel>
        <textarea
          className="create-product-section__textarea"
          name="productDescription"
          value={String(form.productDescription ?? "")}
          onChange={handleChange}
          minLength={PRODUCT_DESCRIPTION_MIN_CHARS}
          maxLength={PRODUCT_DESCRIPTION_MAX_CHARS}
          disabled={isSubmitting}
          placeholder={CREATE_PRODUCT_MODAL_UI.WIZARD_PLACEHOLDER_DESCRIPTION}
          rows={6}
        />
        <span
          className={
            descriptionChars > PRODUCT_DESCRIPTION_MAX_CHARS
              ? "create-product-section__char-meter create-product-section__char-meter_overflow"
              : "create-product-section__char-meter"
          }
        >
          {CREATE_PRODUCT_MODAL_UI.CHARS_USED(descriptionChars, PRODUCT_DESCRIPTION_MAX_CHARS)}
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
  );
}
