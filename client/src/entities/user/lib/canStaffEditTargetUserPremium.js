import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
} from "../model/userConstants.js";

/**
 * @param {{ editorRole?: string | null; targetRole?: string | null }} params
 */
export function canStaffEditTargetUserPremium({ editorRole, targetRole }) {
  if (editorRole === USER_ROLE_ADMIN) {
    return true;
  }
  if (editorRole !== USER_ROLE_MODERATOR) {
    return false;
  }
  return targetRole !== USER_ROLE_ADMIN;
}
