import { ADMIN_ROLE, isStaffRole } from "./adminUserGuard.js";

/**
 * Staff может управлять целью: admin — всеми; moderator — всеми, кроме admin.
 *
 * @param {{ editorRole?: string | null; targetRole?: string | null }} params
 */
export function canStaffManageTargetUser({ editorRole, targetRole }) {
  if (!isStaffRole(editorRole)) {
    return false;
  }
  if (editorRole === ADMIN_ROLE) {
    return true;
  }
  return targetRole !== ADMIN_ROLE;
}

/**
 * @param {{ editorRole?: string | null; targetRole?: string | null }} params
 */
export function canStaffManageTargetPremium({ editorRole, targetRole }) {
  return canStaffManageTargetUser({ editorRole, targetRole });
}

/**
 * @param {{ editorRole?: string | null; targetRole?: string | null }} params
 */
export function assertStaffCanManageTargetPremium({ editorRole, targetRole }) {
  if (!canStaffManageTargetPremium({ editorRole, targetRole })) {
    throw new Error("MODERATOR_CANNOT_MANAGE_ADMIN_PREMIUM");
  }
}

/**
 * Поля, которыми модератор не может трогать администратора.
 */
export const STAFF_ADMIN_PROTECTED_PROFILE_FIELDS = [
  "isBlockedUser",
  "isActiveUser",
  "isUserDataConfirmed",
  "isPremiumUser",
  "premiumExpiresAt",
];

/**
 * @param {Record<string, unknown>} updateData
 */
export function updateTouchesAdminProtectedFields(updateData) {
  return STAFF_ADMIN_PROTECTED_PROFILE_FIELDS.some(
    (field) => updateData[field] !== undefined,
  );
}
