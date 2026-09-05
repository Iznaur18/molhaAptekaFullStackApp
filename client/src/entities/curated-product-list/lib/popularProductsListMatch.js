/** Канонический title подборки на главной — паритет с POPULAR_PRODUCTS_ADMIN_PAGE_UI.TITLE. */
export const POPULAR_PRODUCTS_LIST_TITLE = "Популярные товары";

/**
 * @param {unknown} title
 */
export function isPopularProductsListTitle(title) {
  return (
    String(title ?? "")
      .trim()
      .toLowerCase() === POPULAR_PRODUCTS_LIST_TITLE.toLowerCase()
  );
}

/**
 * @param {Array<{ title?: string } | null | undefined> | null | undefined} lists
 */
export function filterPopularProductsLists(lists) {
  return (Array.isArray(lists) ? lists : []).filter((list) =>
    isPopularProductsListTitle(list?.title),
  );
}

/**
 * @param {{ productIds?: unknown } | null | undefined} list
 * @param {string} productId
 */
export function curatedListContainsProductId(list, productId) {
  const id = String(productId ?? "").trim();
  if (!id) {
    return false;
  }
  const ids = Array.isArray(list?.productIds) ? list.productIds : [];
  return ids.some((item) => String(item) === id);
}

/**
 * Списки региона товара — первыми (удобнее добавить в «свою» Москву).
 *
 * @param {Array<{ regionCode?: string; sortOrder?: number } | null | undefined> | null | undefined} lists
 * @param {string} [productRegionCode]
 */
export function sortCuratedListsForProductRegion(lists, productRegionCode = "") {
  const code = String(productRegionCode ?? "").trim();
  return [...(Array.isArray(lists) ? lists : [])].sort((a, b) => {
    if (code) {
      const aMatch = String(a?.regionCode ?? "").trim() === code ? 0 : 1;
      const bMatch = String(b?.regionCode ?? "").trim() === code ? 0 : 1;
      if (aMatch !== bMatch) {
        return aMatch - bMatch;
      }
    }
    return (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0);
  });
}
