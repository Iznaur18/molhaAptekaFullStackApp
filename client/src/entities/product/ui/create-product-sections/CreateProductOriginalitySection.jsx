import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   setForm: import('react').Dispatch<import('react').SetStateAction<Record<string, unknown>>>;
 *   isSubmitting: boolean;
 *   className?: string;
 * }} props
 */
export function CreateProductOriginalitySection({
  form,
  setForm,
  isSubmitting,
  className = "",
}) {
  const yesSelected = form.productIsOriginal === true;
  const noSelected = form.productIsOriginal === false;

  return (
    <div className={["create-product-section", className].filter(Boolean).join(" ")}>
      <p className="create-product-section__lead">
        {CREATE_PRODUCT_MODAL_UI.ORIGINALITY_STATEMENT}
      </p>
      <fieldset className="create-product-section__listing-origin" disabled={isSubmitting}>
        <legend className="create-product-section__listing-origin-legend">
          <FormFieldLabel required>{CREATE_PRODUCT_MODAL_UI.LABEL_ORIGINALITY}</FormFieldLabel>
        </legend>
        <div
          className="create-product-section__originality-chips"
          role="radiogroup"
          aria-label={CREATE_PRODUCT_MODAL_UI.LABEL_ORIGINALITY}
        >
          <button
            type="button"
            className={[
              "create-product-section__listing-origin-chip",
              yesSelected ? "create-product-section__listing-origin-chip_active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={yesSelected}
            disabled={isSubmitting}
            onClick={() => setForm((prev) => ({ ...prev, productIsOriginal: true }))}
          >
            {CREATE_PRODUCT_MODAL_UI.ORIGINALITY_YES}
          </button>
          <button
            type="button"
            className={[
              "create-product-section__listing-origin-chip",
              noSelected ? "create-product-section__listing-origin-chip_active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={noSelected}
            disabled={isSubmitting}
            onClick={() => setForm((prev) => ({ ...prev, productIsOriginal: false }))}
          >
            {CREATE_PRODUCT_MODAL_UI.ORIGINALITY_NO}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
