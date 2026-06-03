import { UserModel } from '../models/index.js';

/**
 * @returns {Promise<import('mongoose').Types.ObjectId[]>}
 */
export async function getPremiumSellerIds() {
    const now = new Date();
    const rows = await UserModel.find({
        isPremiumUser: true,
        premiumExpiresAt: { $gt: now },
        isBlockedUser: { $ne: true },
        isActiveUser: { $ne: false },
    })
        .select('_id')
        .lean();

    return rows.map((row) => row._id);
}

/**
 * @param {import('mongoose').Types.ObjectId[]} sellerIds
 * @param {import('mongoose').Types.ObjectId[]} hiddenSellerIds
 */
export function filterSellerIdsExcludingHidden(sellerIds, hiddenSellerIds) {
    if (hiddenSellerIds.length === 0) {
        return sellerIds;
    }
    const hidden = new Set(hiddenSellerIds.map((id) => String(id)));
    return sellerIds.filter((id) => !hidden.has(String(id)));
}
