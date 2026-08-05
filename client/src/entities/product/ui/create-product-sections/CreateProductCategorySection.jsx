import { CreateProductCategoryPicker } from "../../../product-category-tree/ui/CreateProductCategoryPicker.jsx";

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
    </div>
  );
}
