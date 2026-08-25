import mongoose from "mongoose";

import { PRODUCT_SOLD_QUANTITY_COUNT_STATUSES } from "../../constants/productSoldQuantityConstants.js";
import { OrderModel, ProductModel } from "../../models/index.js";

const COUNTED_STATUSES = new Set(PRODUCT_SOLD_QUANTITY_COUNT_STATUSES);

/**
 * @param {string | undefined | null} previousStatus
 * @param {string | undefined | null} nextStatus
 * @param {number} quantity
 */
export const computeProductSoldQuantityDelta = (
  previousStatus,
  nextStatus,
  quantity,
) => {
  const qty = Math.max(0, Math.floor(Number(quantity)) || 0);
  if (qty === 0) {
    return 0;
  }

  const wasCounted = COUNTED_STATUSES.has(String(previousStatus ?? ""));
  const isCounted = COUNTED_STATUSES.has(String(nextStatus ?? ""));

  if (wasCounted && !isCounted) {
    return -qty;
  }
  if (!wasCounted && isCounted) {
    return qty;
  }
  return 0;
};

/**
 * @param {import('mongoose').Types.ObjectId | string | null | undefined} productId
 * @param {number} delta
 * @param {import('mongoose').ClientSession | null} [session]
 */
export const applyProductSoldQuantityDelta = async (
  productId,
  delta,
  session = null,
) => {
  if (productId == null || delta === 0) {
    return;
  }

  const options = session ? { session } : {};
  await ProductModel.updateOne(
    { _id: productId },
    { $inc: { soldQuantity: delta } },
    options,
  );

  await ProductModel.updateOne(
    { _id: productId, soldQuantity: { $lt: 0 } },
    { $set: { soldQuantity: 0 } },
    options,
  );
};

/**
 * @param {{
 *   productId: import('mongoose').Types.ObjectId | string | null | undefined;
 *   previousStatus: string | undefined | null;
 *   nextStatus: string | undefined | null;
 *   quantity: number;
 *   session?: import('mongoose').ClientSession | null;
 * }} params
 */
export const applySoldQuantityDeltaForItemStatusChange = async ({
  productId,
  previousStatus,
  nextStatus,
  quantity,
  session = null,
  analytics = null,
}) => {
  const delta = computeProductSoldQuantityDelta(previousStatus, nextStatus, quantity);
  if (delta === 0) {
    return delta;
  }
  await applyProductSoldQuantityDelta(productId, delta, session);

  if (delta > 0 && analytics?.orderId != null && analytics?.itemIndex != null) {
    try {
      const { emitOrderItemSoldEvent } = await import(
        "../analytics-events/emitAnalyticsEvents.js"
      );
      emitOrderItemSoldEvent({
        orderId: String(analytics.orderId),
        itemIndex: Number(analytics.itemIndex),
        productId: String(productId),
        buyerUserId: analytics.buyerUserId ?? null,
        sellerUserId: analytics.sellerUserId ?? null,
        quantity,
        unitPriceAtOrder: analytics.unitPriceAtOrder ?? 0,
        status: String(nextStatus),
      });
    } catch {
      // analytics must not block soldQuantity
    }
  }

  return delta;
};

/** Агрегат из orders для backfill / сверки. */
export const aggregateSoldQuantityRowsFromOrders = async () => {
  return OrderModel.aggregate([
    { $unwind: "$items" },
    {
      $match: {
        "items.status": { $in: PRODUCT_SOLD_QUANTITY_COUNT_STATUSES },
        "items.productId": { $type: "objectId" },
      },
    },
    {
      $group: {
        _id: "$items.productId",
        soldQuantity: { $sum: "$items.quantity" },
      },
    },
  ]);
};

/** Backfill `Product.soldQuantity` из orders; остальные → 0. */
export const rebuildAllProductSoldQuantities = async () => {
  const rows = await aggregateSoldQuantityRowsFromOrders();
  const soldByProductId = new Map(
    rows.map((row) => [String(row._id), Math.max(0, Number(row.soldQuantity) || 0)]),
  );

  const products = await ProductModel.find({}).select("_id").lean();
  const bulkOps = products.map((product) => {
    const soldQuantity = soldByProductId.get(String(product._id)) ?? 0;
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { soldQuantity } },
      },
    };
  });

  if (bulkOps.length > 0) {
    await ProductModel.bulkWrite(bulkOps, { ordered: false });
  }

  return {
    productsUpdated: bulkOps.length,
    productsWithSales: soldByProductId.size,
  };
};

/**
 * @param {string[]} productIds
 * @returns {Promise<Record<string, number>>}
 */
export const getDenormSoldQuantityByProductIds = async (productIds) => {
  const ids = [
    ...new Set(
      productIds.map((id) => String(id)).filter((id) => mongoose.isValidObjectId(id)),
    ),
  ];

  if (ids.length === 0) {
    return {};
  }

  const rows = await ProductModel.find({ _id: { $in: ids } })
    .select("soldQuantity")
    .lean();

  return Object.fromEntries(
    rows.map((row) => [String(row._id), Math.max(0, Number(row.soldQuantity) || 0)]),
  );
};
