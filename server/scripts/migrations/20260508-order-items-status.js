import {
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "../../constants/orderConstants.js";

const allowedLegacyStatuses = new Set([
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CONFIRMED,
]);

const pickInitialItemStatus = (orderStatus) =>
  allowedLegacyStatuses.has(orderStatus) ? orderStatus : ORDER_STATUS_PENDING;

const createSetPatchForItem = (item, initialStatus, pathPrefix) => {
  const patch = {};
  if (typeof item.status !== "string" || item.status.trim() === "") {
    patch[`${pathPrefix}.status`] = initialStatus;
  }
  if (item.deliveredAt === undefined) {
    patch[`${pathPrefix}.deliveredAt`] = null;
  }
  if (item.confirmedAt === undefined) {
    patch[`${pathPrefix}.confirmedAt`] = null;
  }
  if (item.deliveredBy === undefined) {
    patch[`${pathPrefix}.deliveredBy`] = null;
  }
  if (item.confirmedBy === undefined) {
    patch[`${pathPrefix}.confirmedBy`] = null;
  }
  return patch;
};

/**
 * Backfill item-level статус и аудит-поля для существующих заказов.
 *
 * @param {{ db: import("mongodb").Db; isApply: boolean }} ctx
 * @returns {Promise<{ touchedOrders: number; touchedPaths: number }>}
 */
export async function up({ db, isApply }) {
  const ordersCollection = db.collection("orders");
  const orders = await ordersCollection
    .find({ items: { $exists: true, $ne: [] } })
    .toArray();

  let touchedOrders = 0;
  let touchedPaths = 0;

  for (const order of orders) {
    const initialStatus = pickInitialItemStatus(order.status);
    const setPatch = {};

    for (let itemIndex = 0; itemIndex < order.items.length; itemIndex += 1) {
      const item = order.items[itemIndex];
      Object.assign(
        setPatch,
        createSetPatchForItem(item, initialStatus, `items.${itemIndex}`),
      );
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
