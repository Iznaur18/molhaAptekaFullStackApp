/**
 * Продуктовые feature flags. Переопределение через VITE_FF_* в .env (см. .env.example).
 * Значения: "true" | "false" | "1" | "0"; пусто — дефолт.
 *
 * @param {string} key
 * @param {boolean} defaultValue
 * @returns {boolean}
 */
function readBoolEnv(key, defaultValue) {
  const raw = import.meta.env[key];
  if (raw === undefined || raw === "") {
    return defaultValue;
  }

  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return defaultValue;
}

/** @type {Readonly<{ catalogBrowserSubcategoryFilter: boolean; productCategoryTreePicker: boolean; requireAddressFromDadataSuggest: boolean }>} */
export const FEATURE_FLAGS = Object.freeze({
  catalogBrowserSubcategoryFilter: readBoolEnv(
    "VITE_FF_CATALOG_BROWSER_SUBCATEGORY_FILTER",
    true,
  ),
  productCategoryTreePicker: readBoolEnv(
    "VITE_FF_PRODUCT_CATEGORY_TREE_PICKER",
    true,
  ),
  requireAddressFromDadataSuggest: readBoolEnv(
    "VITE_FF_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST",
    false,
  ),
});

export const IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED =
  FEATURE_FLAGS.catalogBrowserSubcategoryFilter;

export const IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED =
  FEATURE_FLAGS.productCategoryTreePicker;

export const IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED =
  FEATURE_FLAGS.requireAddressFromDadataSuggest;
