import { isStaffRole } from './adminUserGuard.js';

/** Ответ при попытке посмотреть чужие покупки без премиум / staff. */
export const OTHER_USER_PURCHASES_PREMIUM_ONLY_MESSAGE =
    'Список покупок других пользователей доступен с премиум';

/**
 * @param {{ userRole?: string; isBlockedUser?: boolean; isPremiumUser?: boolean } | null | undefined} viewer
 */
export function canViewerSeeOtherUserPurchases(viewer) {
    if (!viewer || viewer.isBlockedUser) {
        return false;
    }
    if (isStaffRole(viewer.userRole)) {
        return true;
    }
    return Boolean(viewer.isPremiumUser);
}
