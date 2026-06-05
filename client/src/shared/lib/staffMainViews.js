/** @typedef {import('./homeMainViewPaths.js').HomeMainView} HomeMainView */

/** Standalone staff/admin маршруты (`StaffLayout` + guard). */
export const STAFF_STANDALONE_MAIN_VIEWS = /** @type {const} */ ([
  "admin-orders",
  "search-synonyms-admin",
  "category-tree-admin",
  "product-moderation",
  "product-reports",
  "product-promotions",
  "staff-raffles",
  "data-confirmation-requests",
  "installment-moderation",
  "installment-disputes",
]);

/** @type {Set<HomeMainView>} */
export const STAFF_STANDALONE_MAIN_VIEW_SET = new Set(STAFF_STANDALONE_MAIN_VIEWS);

/**
 * @param {string} view
 */
export function isStaffStandaloneMainView(view) {
  return STAFF_STANDALONE_MAIN_VIEW_SET.has(/** @type {HomeMainView} */ (view));
}
