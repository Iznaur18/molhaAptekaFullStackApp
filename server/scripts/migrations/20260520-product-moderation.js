import {
    PRODUCT_MODERATION_APPROVED,
} from '../../constants/productModerationConstants.js';

/**
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
    const products = db.collection('products');
    const filter = {
        $or: [
            { productModerationStatus: { $exists: false } },
            { productModerationStatus: null },
            { productModerationStatus: '' },
        ],
    };

    const matched = await products.countDocuments(filter);

    if (!isApply) {
        return { matched, wouldMigrate: matched };
    }

    const result = await products.updateMany(filter, {
        $set: {
            productModerationStatus: PRODUCT_MODERATION_APPROVED,
            productModerationComment: '',
        },
    });

    return { matched, modified: result.modifiedCount };
}
