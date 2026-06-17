import { STAFF_SECTION_IDS, isStaffSectionAllowed, isStaffSectionId } from "@izibuy/shared-lib";

export const STAFF_STANDALONE_MAIN_VIEWS = STAFF_SECTION_IDS;
export const STAFF_STANDALONE_MAIN_VIEW_SET = new Set(STAFF_STANDALONE_MAIN_VIEWS);

/**
 * @param {string} view
 */
export function isStaffStandaloneMainView(view) {
  return isStaffSectionId(view);
}

/**
 * @param {string} view
 * @returns {{ requireAdmin: boolean; requireModerator: boolean } | null}
 */
export function getStaffMainViewAccess(view) {
  if (!isStaffSectionId(view)) {
    return null;
  }

  return {
    requireAdmin: isStaffSectionAllowed(view, { isAdmin: false, canModerate: true }) === false,
    requireModerator: isStaffSectionAllowed(view, { isAdmin: true, canModerate: false }) === false,
  };
}

/**
 * @param {string} view
 * @param {{ isAdmin: boolean; canModerateProducts: boolean }} access
 */
export function isStaffMainViewAllowed(view, { isAdmin, canModerateProducts }) {
  if (!isStaffSectionId(view)) {
    return true;
  }

  return isStaffSectionAllowed(view, {
    isAdmin,
    canModerate: canModerateProducts,
  });
}
