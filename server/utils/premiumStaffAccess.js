import { ADMIN_ROLE, isStaffRole } from './adminUserGuard.js';

/**
 * @param {{ editorRole?: string | null; targetRole?: string | null }} params
 */
export function canStaffManageTargetPremium({ editorRole, targetRole }) {
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
export function assertStaffCanManageTargetPremium({ editorRole, targetRole }) {
    if (!canStaffManageTargetPremium({ editorRole, targetRole })) {
        throw new Error('MODERATOR_CANNOT_MANAGE_ADMIN_PREMIUM');
    }
}
