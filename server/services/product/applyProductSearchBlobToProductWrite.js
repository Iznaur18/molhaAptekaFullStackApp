import { buildProductSearchBlobFromFields } from "./buildProductSearchBlob.js";

/**
 * @param {Record<string, unknown>} $set
 * @param {{
 *   productName?: string;
 *   productDescription?: string;
 *   productCharacteristics?: { key?: string; value?: string }[];
 *   productCategory?: string;
 *   categoryBreadcrumbRu?: string;
 *   categoryPathLabelRu?: string[];
 *   categorySearchKeywords?: string[];
 * }} existing
 */
export const applyProductSearchBlobToSet = ($set, existing) => {
  $set.productSearchBlob = buildProductSearchBlobFromFields({
    productName:
      typeof $set.productName === "string" ? $set.productName : existing.productName,
    productDescription:
      typeof $set.productDescription === "string"
        ? $set.productDescription
        : existing.productDescription,
    productCharacteristics: Array.isArray($set.productCharacteristics)
      ? $set.productCharacteristics
      : existing.productCharacteristics,
    productCategory:
      typeof $set.productCategory === "string"
        ? $set.productCategory
        : existing.productCategory,
    categoryBreadcrumbRu:
      typeof $set.categoryBreadcrumbRu === "string"
        ? $set.categoryBreadcrumbRu
        : existing.categoryBreadcrumbRu,
    categoryPathLabelRu: Array.isArray($set.categoryPathLabelRu)
      ? $set.categoryPathLabelRu
      : existing.categoryPathLabelRu,
    categorySearchKeywords: Array.isArray($set.categorySearchKeywords)
      ? $set.categorySearchKeywords
      : existing.categorySearchKeywords,
  });
};
