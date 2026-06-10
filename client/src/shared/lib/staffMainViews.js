/** @typedef {import('./homeMainViewPaths.js').HomeMainView} HomeMainView */

/** @typedef {{ requireAdmin: boolean; requireModerator: boolean }} StaffMainViewAccess */

/** Staff/admin вкладки профиля. */
export const STAFF_STANDALONE_MAIN_VIEWS = /** @type {const} */ ([
  "admin-orders",
  "search-synonyms-admin",
  "category-tree-admin",
  "app-intro-admin",
  "product-moderation",
  "intro-ad-moderation",
  "seller-personal-category-moderation",
  "product-reports",
  "staff-raffles",
  "data-confirmation-requests",
  "installment-moderation",
  "installment-disputes",
]);

/** @type {Record<HomeMainView, StaffMainViewAccess>} */
export const STAFF_MAIN_VIEW_ACCESS = {
  "admin-orders": { requireAdmin: true, requireModerator: false },
  "search-synonyms-admin": { requireAdmin: true, requireModerator: false },
  "category-tree-admin": { requireAdmin: true, requireModerator: false },
  "app-intro-admin": { requireAdmin: true, requireModerator: false },
  "product-moderation": { requireAdmin: false, requireModerator: true },
  "intro-ad-moderation": { requireAdmin: false, requireModerator: true },
  "seller-personal-category-moderation": { requireAdmin: false, requireModerator: true },
  "product-reports": { requireAdmin: false, requireModerator: true },
  "staff-raffles": { requireAdmin: false, requireModerator: true },
  "data-confirmation-requests": { requireAdmin: false, requireModerator: true },
  "installment-moderation": { requireAdmin: false, requireModerator: true },
  "installment-disputes": { requireAdmin: false, requireModerator: true },
};

/** @type {Set<HomeMainView>} */
export const STAFF_STANDALONE_MAIN_VIEW_SET = new Set(STAFF_STANDALONE_MAIN_VIEWS);

/**
 * @param {string} view
 */
export function isStaffStandaloneMainView(view) {
  return STAFF_STANDALONE_MAIN_VIEW_SET.has(/** @type {HomeMainView} */ (view));
}

/**
 * @param {HomeMainView} view
 * @returns {StaffMainViewAccess | null}
 */
export function getStaffMainViewAccess(view) {
  return STAFF_MAIN_VIEW_ACCESS[/** @type {HomeMainView} */ (view)] ?? null;
}

/**
 * @param {HomeMainView} view
 * @param {{ isAdmin: boolean; canModerateProducts: boolean }} access
 */
export function isStaffMainViewAllowed(view, { isAdmin, canModerateProducts }) {
  const staffAccess = getStaffMainViewAccess(view);
  if (!staffAccess) {
    return true;
  }
  return (
    (staffAccess.requireAdmin ? isAdmin : true) &&
    (staffAccess.requireModerator ? canModerateProducts : true)
  );
}
