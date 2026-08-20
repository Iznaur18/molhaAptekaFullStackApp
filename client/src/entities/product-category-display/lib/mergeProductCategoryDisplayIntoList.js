/**
 * Подмена/добавление display в кэше GET /product/category-displays.
 * Старое `a && b` оставляло slug-orphan при ответе только с categoryId.
 *
 * @param {import('../model/types.js').ProductCategoryDisplayFromApi[]} displays
 * @param {import('../model/types.js').ProductCategoryDisplayFromApi} display
 */
export function mergeProductCategoryDisplayIntoList(displays, display) {
  const nextId =
    typeof display.categoryId === "string" && display.categoryId.trim()
      ? display.categoryId.trim()
      : null;
  const nextSlug =
    typeof display.categorySlug === "string" && display.categorySlug.trim()
      ? display.categorySlug.trim()
      : null;

  return [
    ...displays.filter((row) => {
      const rowId =
        typeof row.categoryId === "string" && row.categoryId.trim()
          ? row.categoryId.trim()
          : null;
      const rowSlug =
        typeof row.categorySlug === "string" && row.categorySlug.trim()
          ? row.categorySlug.trim()
          : null;

      if (nextId && rowId && rowId === nextId) {
        return false;
      }
      if (nextSlug && rowSlug && rowSlug === nextSlug) {
        return false;
      }
      return true;
    }),
    display,
  ];
}
