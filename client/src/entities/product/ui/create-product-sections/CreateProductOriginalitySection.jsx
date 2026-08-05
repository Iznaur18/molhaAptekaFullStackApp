import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
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
  return (
    <div className={["create-product-section", className].filter(Boolean).join(" ")}>
      <ProductWizardStepHeadline
        title={CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_ORIGINALITY_TITLE}
        required
      />
      <p className="create-product-section__hint">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_ORIGINALITY_SUBTITLE}
      </p>
      <fieldset className="create-product-section__listing-origin" disabled={isSubmitting}>
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
    </div>
  );
}
