/** Максимальная глубина дерева (0 = корень). */
export const PRODUCT_CATEGORY_TREE_MAX_DEPTH = 4;

/**
 * Fallback slug, когда дерева ещё нет / id удалён.
 * Не узел каталога — не сидится и не показывается в roots.
 *
 * SSOT в контракте: там же зашито, что фильтр `GET /product` его принимает.
 * Своя копия литерала здесь однажды разъехалась с zod-схемой запроса, и
 * карточки товаров из 1С получали 400 на «похожие».
 */
export { UNCATEGORIZED_PRODUCT_CATEGORY_SLUG } from "@molha/api-contract";

/** SSOT: `contract/src/productCategoryAdmin.js`. */
export {
  PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
  PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
  PRODUCT_CATEGORY_SEARCH_KEYWORD_MAX_LENGTH,
  PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT,
} from "@molha/api-contract";
