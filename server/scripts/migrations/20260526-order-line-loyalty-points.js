/**
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 * @returns {Promise<{ touchedOrders: number; touchedPaths: number }>}
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
            if (item?.loyaltyPointsAwarded === undefined) {
                setPatch[`items.${itemIndex}.loyaltyPointsAwarded`] = false;
            }
            if (item?.loyaltyPointsEarned === undefined) {
                setPatch[`items.${itemIndex}.loyaltyPointsEarned`] = 0;
            }
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
