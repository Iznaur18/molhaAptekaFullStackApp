import { OrderModel, ProductModel, UserModel } from '../../models/index.js';

export const up = async () => {
    await ProductModel.updateMany(
        { loyaltyPointsPerUnit: { $exists: false } },
        { $set: { loyaltyPointsPerUnit: 0 } },
    );

    await UserModel.updateMany(
        { userLoyaltyPointsReserved: { $exists: false } },
        { $set: { userLoyaltyPointsReserved: 0 } },
    );

    const orders = await OrderModel.find({}).select('items').lean();
    for (const order of orders) {
        if (!Array.isArray(order.items) || order.items.length === 0) {
            continue;
        }

        const setPatch = {};
        order.items.forEach((item, itemIndex) => {
            if (item?.loyaltyPointsPerUnitAtOrder === undefined) {
                setPatch[`items.${itemIndex}.loyaltyPointsPerUnitAtOrder`] = 0;
            }
            if (item?.loyaltyPointsReservedTotal === undefined) {
                setPatch[`items.${itemIndex}.loyaltyPointsReservedTotal`] = 0;
            }
            if (item?.loyaltyPointsReserveReleased === undefined) {
                setPatch[`items.${itemIndex}.loyaltyPointsReserveReleased`] = false;
            }
        });

        if (Object.keys(setPatch).length > 0) {
            await OrderModel.updateOne({ _id: order._id }, { $set: setPatch });
        }
    }
};
