/** Максимальная глубина дерева (0 = корень). */
export const PRODUCT_CATEGORY_TREE_MAX_DEPTH = 4;

/**
 * Fallback slug, когда дерева ещё нет / id удалён.
 * Не узел каталога — не сидится и не показывается в roots.
 */
export const UNCATEGORIZED_PRODUCT_CATEGORY_SLUG = "uncategorized";

/** SSOT: `contract/src/productCategoryAdmin.js`. */
export {
  PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
  PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
  PRODUCT_CATEGORY_SEARCH_KEYWORD_MAX_LENGTH,
  PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT,
} from "@molha/api-contract";
