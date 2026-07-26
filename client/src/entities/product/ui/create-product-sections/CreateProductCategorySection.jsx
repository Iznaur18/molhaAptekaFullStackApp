import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import { CreateProductCategoryPicker } from "../../../product-category-tree/ui/CreateProductCategoryPicker.jsx";
import { RuRegionSelect } from "../../../region/ui/RuRegionSelect.jsx";
import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   setForm: import('react').Dispatch<import('react').SetStateAction<Record<string, unknown>>>;
 *   isSubmitting: boolean;
 *   handleChange?: import('react').ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
 *   className?: string;
 * }} props
 */
export function CreateProductCategorySection({
  form,
  setForm,
  isSubmitting,
  className = "",
}) {
  return (
    <div className={["create-product-section", className].filter(Boolean).join(" ")}>
      <p className="create-product-section__lead">{CREATE_PRODUCT_MODAL_UI.WIZARD_CATEGORY_LEAD}</p>
      <CreateProductCategoryPicker
        value={{
          productCategoryId: form.productCategoryId,
          categoryBreadcrumbRu: form.categoryBreadcrumbRu,
          productCategory: form.productCategory,
        }}
        disabled={isSubmitting}
        onChange={({ productCategoryId, categoryBreadcrumbRu, productCategory }) =>
          setForm((prev) => ({
            ...prev,
            productCategoryId,
            categoryBreadcrumbRu,
            productCategory,
          }))
        }
      />
      <label className="create-product-section__label">
        <FormFieldLabel>{CREATE_PRODUCT_MODAL_UI.LABEL_SALE_REGION}</FormFieldLabel>
        <RuRegionSelect
          className="create-product-section__input"
          value={String(form.productRegionCode || DEFAULT_VIEWER_REGION_CODE)}
          disabled={isSubmitting}
          required
          onChange={(productRegionCode) =>
            setForm((prev) => ({ ...prev, productRegionCode }))
          }
        />
        <span className="create-product-section__hint">
          {CREATE_PRODUCT_MODAL_UI.HINT_SALE_REGION}
        </span>
      </label>
    </div>
  );
}
