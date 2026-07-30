import { createCharacteristicRow } from "./createCharacteristicRow.js";

/**
 * Подставить ключи характеристик по категории, если продавец ещё не правил строки.
 *
 * @param {{
 *   productCategoryId: string | null | undefined;
 *   categoryDefaultCharacteristicKeys?: unknown;
 *   productCharacteristicRows?: { id: string; key: string; value: string }[];
 *   productCharacteristicsSellerTouched?: boolean;
 *   productCharacteristicsAutoAppliedForCategoryId?: string | null;
 * }} form
 * @returns {null | {
 *   productCharacteristicRows: { id: string; key: string; value: string }[];
 *   productCharacteristicsAutoAppliedForCategoryId: string | null;
 *   productCharacteristicsSellerTouched: false;
 * }}
 */
export function resolveCategoryDefaultCharacteristicRowsPatch(form) {
  if (form.productCharacteristicsSellerTouched === true) {
    return null;
  }

  const categoryId =
    typeof form.productCategoryId === "string" && form.productCategoryId.trim()
      ? form.productCategoryId.trim()
      : null;

  const appliedFor =
    typeof form.productCharacteristicsAutoAppliedForCategoryId === "string" &&
    form.productCharacteristicsAutoAppliedForCategoryId.trim()
      ? form.productCharacteristicsAutoAppliedForCategoryId.trim()
      : null;

  if (categoryId && appliedFor === categoryId) {
    return null;
  }

  if (!categoryId && appliedFor == null) {
    const rows = Array.isArray(form.productCharacteristicRows)
      ? form.productCharacteristicRows
      : [];
    if (rows.length === 0) {
      return null;
    }
  }

  const keys = Array.isArray(form.categoryDefaultCharacteristicKeys)
    ? form.categoryDefaultCharacteristicKeys
        .map((key) => String(key ?? "").trim())
        .filter(Boolean)
    : [];

  return {
    productCharacteristicRows: keys.map((key) => createCharacteristicRow(key, "")),
    productCharacteristicsAutoAppliedForCategoryId: categoryId,
    productCharacteristicsSellerTouched: false,
  };
}
