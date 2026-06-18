import { ProductImageUrlSortableList } from "../ProductImageUrlSortableList.jsx";
import { ProductPreviewVideoField } from "../ProductPreviewVideoField.jsx";
import { CREATE_PRODUCT_MODAL_UI, PRODUCT_PREVIEW_VIDEO_UI } from "../../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   setForm: import('react').Dispatch<import('react').SetStateAction<Record<string, unknown>>>;
 *   isSubmitting: boolean;
 *   className?: string;
 * }} props
 */
export function CreateProductMediaSection({ form, setForm, isSubmitting, className = "" }) {
  return (
    <div className={["create-product-section", className].filter(Boolean).join(" ")}>
      <p className="create-product-section__lead">{CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_LEAD}</p>
      <ProductImageUrlSortableList
        rows={form.productImageRows}
        onRowsChange={(productImageRows) =>
          setForm((prev) => ({ ...prev, productImageRows }))
        }
        disabled={isSubmitting}
      />
      <div className="create-product-section__label">
        <FormFieldLabel>{PRODUCT_PREVIEW_VIDEO_UI.LABEL}</FormFieldLabel>
        <ProductPreviewVideoField
          value={String(form.productPreviewVideoUrl ?? "")}
          onChange={(productPreviewVideoUrl) =>
            setForm((prev) => ({ ...prev, productPreviewVideoUrl }))
          }
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
