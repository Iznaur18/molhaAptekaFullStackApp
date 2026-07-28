import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { ProductWizardStepHeadline } from "../../../../shared/ui/ProductWizardProgress/ProductWizardStepHeadline.jsx";
import { PRODUCT_LISTING_ORIGIN_OPTIONS } from "../../lib/productListingOrigin.js";

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
      <fieldset className="create-product-section__listing-origin" disabled={isSubmitting}>
        <legend className="create-product-section__listing-origin-legend">
          <FormFieldLabel required>{CREATE_PRODUCT_MODAL_UI.LABEL_LISTING_ORIGIN}</FormFieldLabel>
        </legend>
        <div
          className="create-product-section__listing-origin-chips"
          role="radiogroup"
          aria-label={CREATE_PRODUCT_MODAL_UI.LABEL_LISTING_ORIGIN}
        >
          {PRODUCT_LISTING_ORIGIN_OPTIONS.map((option) => {
            const selected = form.productListingOrigin === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={[
                  "create-product-section__listing-origin-chip",
                  selected ? "create-product-section__listing-origin-chip_active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selected}
                disabled={isSubmitting}
                onClick={() =>
                  setForm((prev) => ({ ...prev, productListingOrigin: option.value }))
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <ProductWizardStepHeadline
        title={CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_ORIGINALITY_TITLE}
      />
      <p className="create-product-section__hint">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_ORIGINALITY_SUBTITLE}
      </p>
      <p className="create-product-section__lead">
        {CREATE_PRODUCT_MODAL_UI.ORIGINALITY_STATEMENT}
      </p>
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
    </div>
  );
}
