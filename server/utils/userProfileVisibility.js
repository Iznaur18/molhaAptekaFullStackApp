import { ADMIN_ROLE } from './adminUserGuard.js';

/**
 * @param {{ userRole?: string; isBlockedUser?: boolean } | null | undefined} viewer
 */
export function isPrivilegedAdminViewer(viewer) {
    return Boolean(
        viewer && viewer.userRole === ADMIN_ROLE && !viewer.isBlockedUser,
    );
}

/**
 * @param {{ userRole?: string; _id?: unknown }} targetUser
 * @param {{ viewer?: { userRole?: string; isBlockedUser?: boolean; _id?: string } | null; viewerId?: string | null }} ctx
 */
export function shouldHideAdminProfile(targetUser, ctx) {
    if (!targetUser || targetUser.userRole !== ADMIN_ROLE) {
        return false;
    }
    const targetId = String(targetUser._id ?? '');
    const viewerId = ctx.viewerId ? String(ctx.viewerId) : '';
    if (viewerId && viewerId === targetId) {
        return false;
    }
    return !isPrivilegedAdminViewer(ctx.viewer);
}

/**
 * @param {Record<string, unknown>} user
 * @param {{ viewer?: { userRole?: string; isBlockedUser?: boolean; _id?: string } | null; viewerId?: string | null }} ctx
 * @returns {Record<string, unknown> | null} null → ответ 404
 */
export function sanitizeUserProfileForViewer(user, ctx) {
    if (shouldHideAdminProfile(user, ctx)) {
        return null;
    }

    const out = { ...user };
    const privileged = isPrivilegedAdminViewer(ctx.viewer);
    const viewerId = ctx.viewerId ? String(ctx.viewerId) : '';
    const isSelf = viewerId && viewerId === String(user._id ?? '');

    if (!privileged && !isSelf) {
        delete out.userRole;
        delete out.isActiveUser;
        delete out.isBlockedUser;
        delete out.userDiscountPercent;
        delete out.notesAboutUser;
    }

    return out;
}

/**
 * @param {Record<string, unknown>} query
 * @param {{ viewer?: { userRole?: string; isBlockedUser?: boolean } | null; roleFilter?: string }} ctx
 */
export function applyAdminVisibilityToUsersSearchQuery(usersQuery, ctx) {
    const { viewer, roleFilter } = ctx;

    if (roleFilter === ADMIN_ROLE) {
        if (!isPrivilegedAdminViewer(viewer)) {
            usersQuery.userRole = ADMIN_ROLE;
            usersQuery._id = { $exists: false };
            return;
        }
        usersQuery.userRole = ADMIN_ROLE;
        return;
    }

    if (roleFilter) {
        usersQuery.userRole = roleFilter;
        return;
    }

    usersQuery.userRole = { $ne: ADMIN_ROLE };
}

/**
 * @param {Record<string, unknown>[]} users
 * @param {{ viewer?: { userRole?: string; isBlockedUser?: boolean } | null }} ctx
 */
export function sanitizeUsersSearchList(users, ctx) {
    if (isPrivilegedAdminViewer(ctx.viewer)) {
        return users;
    }

    return users.map((row) => {
        const item = { ...row };
        delete item.userRole;
        delete item.isActiveUser;
        delete item.isBlockedUser;
        return item;
    });
}
