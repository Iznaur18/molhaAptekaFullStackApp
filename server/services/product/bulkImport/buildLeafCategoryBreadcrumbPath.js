import { PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR } from "../resolveProductCategoryWrite.js";

/**
 * @param {string} rawPath
 */
export const parseCategoryBreadcrumbParts = (rawPath) =>
  String(rawPath ?? "")
    .split(/[>›/|]+/)
    .map((part) => part.trim())
    .filter(Boolean);

/**
 * @param {{ pathLabelRu?: string[]; labelRu?: string } | null | undefined} leaf
 * @returns {string}
 */
export function buildLeafCategoryBreadcrumbPath(leaf) {
  const pathLabelRu = Array.isArray(leaf?.pathLabelRu)
    ? leaf.pathLabelRu.map((part) => String(part).trim()).filter(Boolean)
    : [];
  const labelRu = String(leaf?.labelRu ?? "").trim();

  if (pathLabelRu.length === 0) {
    return labelRu;
  }

  const last = pathLabelRu[pathLabelRu.length - 1];
  if (labelRu && last.toLowerCase() !== labelRu.toLowerCase()) {
    pathLabelRu.push(labelRu);
  }

  return pathLabelRu.join(PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR);
}

/**
 * @param {string} rawPath
 * @returns {string}
 */
export function normalizeCategoryBreadcrumbKey(rawPath) {
  return parseCategoryBreadcrumbParts(rawPath)
    .map((part) => part.toLowerCase())
    .join(" / ");
}
