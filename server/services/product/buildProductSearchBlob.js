import { PRODUCT_CATEGORY_LABEL_RU } from "../../constants/productCategoryLabels.js";
import { normalizeProductSearchText } from "./normalizeProductSearchText.js";

/**
 * @param {{ key?: string; value?: string }[]} characteristics
 * @returns {string}
 */
const characteristicsToSearchText = (characteristics) => {
  if (!Array.isArray(characteristics)) return "";
  return characteristics
    .map((item) => {
      const key = typeof item?.key === "string" ? item.key.trim() : "";
      const value = typeof item?.value === "string" ? item.value.trim() : "";
      return key || value ? `${key} ${value}`.trim() : "";
    })
    .filter(Boolean)
    .join(" ");
};

/**
 * @param {{
 *   productName?: string;
 *   productDescription?: string;
 *   productCharacteristics?: { key?: string; value?: string }[];
 *   productCategory?: string;
 *   categoryBreadcrumbRu?: string;
 *   categoryPathLabelRu?: string[];
 *   categorySearchKeywords?: string[];
 * }} fields
 * @returns {string}
 */
export const buildProductSearchBlobFromFields = ({
  productName,
  productDescription,
  productCharacteristics,
  productCategory,
  categoryBreadcrumbRu,
  categoryPathLabelRu,
  categorySearchKeywords,
}) => {
  const name = typeof productName === "string" ? productName.trim() : "";
  const description =
    typeof productDescription === "string" ? productDescription.trim() : "";
  const categorySlug =
    typeof productCategory === "string" ? productCategory.trim() : "";
  const categoryLabel =
    categorySlug && PRODUCT_CATEGORY_LABEL_RU[categorySlug]
      ? PRODUCT_CATEGORY_LABEL_RU[categorySlug]
      : "";
  const breadcrumb =
    typeof categoryBreadcrumbRu === "string" ? categoryBreadcrumbRu.trim() : "";
  const pathLabels = Array.isArray(categoryPathLabelRu)
    ? categoryPathLabelRu.map((label) => String(label).trim()).filter(Boolean)
    : [];
  const nodeKeywords = Array.isArray(categorySearchKeywords)
    ? categorySearchKeywords.map(String).filter(Boolean)
    : [];

  const parts = [
    name,
    description,
    characteristicsToSearchText(productCharacteristics),
    breadcrumb,
    ...pathLabels,
    ...nodeKeywords,
    categoryLabel,
    categorySlug,
  ].filter((part) => part !== "");

  return normalizeProductSearchText(parts.join(" "));
};
