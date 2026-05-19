import { UserModel } from '../models/index.js';

export const ADMIN_ROLE = 'admin';

export async function countAdminUsers(excludeUserId = null) {
    const query = { userRole: ADMIN_ROLE };
    if (excludeUserId) {
        query._id = { $ne: excludeUserId };
    }
    return UserModel.countDocuments(query);
}

/**
 * @param {string} targetUserId
 * @param {string | undefined} nextRole
 */
export async function assertCanSetUserRole(targetUserId, nextRole) {
    const target = await UserModel.findById(targetUserId).select('userRole').lean();
    if (!target) {
        throw new Error('Пользователь не найден');
    }
    if (target.userRole === ADMIN_ROLE && nextRole !== ADMIN_ROLE) {
        const remaining = await countAdminUsers(targetUserId);
        if (remaining === 0) {
            throw new Error('Нельзя снять роль admin у единственного администратора');
        }
    }
}

/**
 * @param {string} targetUserId
 */
export async function assertCanDeleteUser(targetUserId) {
    const target = await UserModel.findById(targetUserId).select('userRole').lean();
    if (!target) {
        throw new Error('Пользователь не найден');
    }
    if (target.userRole === ADMIN_ROLE) {
        const remaining = await countAdminUsers(targetUserId);
        if (remaining === 0) {
            throw new Error('Нельзя удалить единственного администратора');
        }
    }
}

/**
 * @returns {Promise<import('mongoose').Types.ObjectId[]>}
 */
export async function getBlockedUserIds() {
    const rows = await UserModel.find({ isBlockedUser: true }).select('_id').lean();
    return rows.map((row) => row._id);
}

/** Продавцы, чьи товары не показываем в публичном каталоге. */
export async function getHiddenSellerIds() {
    const rows = await UserModel.find({
        $or: [
            { isBlockedUser: true },
            { isActiveUser: false },
            { userRole: ADMIN_ROLE },
        ],
    })
        .select('_id')
        .lean();
    return rows.map((row) => row._id);
}
