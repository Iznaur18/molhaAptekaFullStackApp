import { ObjectId } from 'mongodb';

import { ORDER_LINE_ITEM_DELETED_PRODUCT_NAME } from '../../constants/orderConstants.js';

/**
 * @param {import('mongodb').Db} db
 * @param {unknown} productId
 * @returns {Promise<string>}
 */
async function resolveNameFromProduct(db, productId) {
    if (productId == null) {
        return ORDER_LINE_ITEM_DELETED_PRODUCT_NAME;
    }

    let objectId;
    try {
        objectId =
            productId instanceof ObjectId ? productId : new ObjectId(String(productId));
    } catch {
        return ORDER_LINE_ITEM_DELETED_PRODUCT_NAME;
    }

    const product = await db.collection('products').findOne(
        { _id: objectId },
        { projection: { productName: 1 } },
    );
    const name =
        typeof product?.productName === 'string' ? product.productName.trim() : '';
    return name.length > 0 ? name : ORDER_LINE_ITEM_DELETED_PRODUCT_NAME;
}

/**
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
    const ordersCollection = db.collection('orders');
    const orders = await ordersCollection
        .find({ items: { $exists: true, $ne: [] } })
        .toArray();

    let touchedOrders = 0;
    let touchedPaths = 0;

    for (const order of orders) {
        const setPatch = {};

        for (let itemIndex = 0; itemIndex < order.items.length; itemIndex += 1) {
            const item = order.items[itemIndex];
            const existing =
                typeof item?.productNameAtOrder === 'string'
                    ? item.productNameAtOrder.trim()
                    : '';
            if (existing.length > 0) continue;

            const name = await resolveNameFromProduct(db, item?.productId);
            setPatch[`items.${itemIndex}.productNameAtOrder`] = name;
        }

        const changedPaths = Object.keys(setPatch).length;
        if (changedPaths === 0) continue;

        touchedOrders += 1;
        touchedPaths += changedPaths;

        if (isApply) {
            await ordersCollection.updateOne({ _id: order._id }, { $set: setPatch });
        }
    }

    return { touchedOrders, touchedPaths };
}
