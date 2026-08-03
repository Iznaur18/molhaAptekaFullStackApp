import { getRuRegionByCode } from "@molha/api-contract";

import { CreateProductCategoryPicker } from "../../../product-category-tree/ui/CreateProductCategoryPicker.jsx";
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
  const regionName =
    getRuRegionByCode(String(form.productRegionCode ?? "").trim())?.name ?? null;

  return (
    <div className={["create-product-section", className].filter(Boolean).join(" ")}>
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
          defaultCharacteristicKeys = [],
        }) =>
          setForm((prev) => ({
            ...prev,
            productCategoryId,
            categoryBreadcrumbRu,
            productCategory,
            categoryDefaultCharacteristicKeys: Array.isArray(defaultCharacteristicKeys)
              ? defaultCharacteristicKeys
              : [],
            ...(prev.productCharacteristicsSellerTouched === true
              ? {}
              : { productCharacteristicsAutoAppliedForCategoryId: null }),
          }))
        }
      />
      <p className="create-product-section__hint">
        <FormFieldLabel>{CREATE_PRODUCT_MODAL_UI.LABEL_SALE_REGION}</FormFieldLabel>
        {": "}
        {regionName || CREATE_PRODUCT_MODAL_UI.HINT_SALE_REGION_FROM_ADDRESS}
      </p>
    </div>
  );
}
