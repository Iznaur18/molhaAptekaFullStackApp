import { PRODUCT_SOLD_QUANTITY_COUNT_STATUSES } from "../../constants/productSoldQuantityConstants.js";
import {
  OrderModel,
  ProductModel,
  ProductViewModel,
  UserModel,
} from "../../models/index.js";
import { ADMIN_ANALYTICS_DEFINITIONS_VERSION } from "../../constants/analyticsConstants.js";
import {
  buildCreatedAtPeriodMatch,
  resolveAnalyticsPeriodRange,
} from "./resolveAnalyticsPeriodRange.js";
import { getLatestAnalyticsReconciliation } from "./getLatestAnalyticsReconciliation.js";

/**
 * @param {{ period?: string }} query
 */
export async function getPlatformAnalyticsOverview(query = {}) {
  const asOf = new Date();
  const range = resolveAnalyticsPeriodRange(query.period, asOf);
  const createdMatch = buildCreatedAtPeriodMatch(range.from, range.to);

  const [
    newUsers,
    publicationsCreated,
    ordersCreated,
    productViewsUnique,
    sales,
    reconciliation,
  ] = await Promise.all([
    UserModel.countDocuments(createdMatch),
    ProductModel.countDocuments(createdMatch),
    OrderModel.countDocuments(createdMatch),
    ProductViewModel.countDocuments(createdMatch),
    aggregateSalesInPeriod(range.from, range.to),
    getLatestAnalyticsReconciliation(),
  ]);

  return {
    asOf: asOf.toISOString(),
    definitionsVersion: ADMIN_ANALYTICS_DEFINITIONS_VERSION,
    period: {
      key: range.key,
      from: range.from ? range.from.toISOString() : null,
      to: range.to.toISOString(),
    },
    metrics: {
      newUsers,
      publicationsCreated,
      ordersCreated,
      soldUnits: sales.soldUnits,
      gmvRub: sales.gmvRub,
      productViewsUnique,
    },
    reconciliation,
  };
}

/**
 * @param {Date | null} from
 * @param {Date} to
 */
async function aggregateSalesInPeriod(from, to) {
  const saleAtFilter =
    from == null ? { saleAt: { $lte: to } } : { saleAt: { $gte: from, $lte: to } };

  const [row] = await OrderModel.aggregate([
    { $unwind: "$items" },
    {
      $match: {
        "items.status": { $in: PRODUCT_SOLD_QUANTITY_COUNT_STATUSES },
      },
    },
    {
      $addFields: {
        saleAt: {
          $ifNull: [
            "$items.deliveredAt",
            { $ifNull: ["$items.confirmedAt", "$createdAt"] },
          ],
        },
      },
    },
    { $match: saleAtFilter },
    {
      $group: {
        _id: null,
        soldUnits: { $sum: "$items.quantity" },
        gmvRub: {
          $sum: {
            $multiply: ["$items.quantity", "$items.unitPriceAtOrder"],
          },
        },
      },
    },
  ]);

  return {
    soldUnits: Math.max(0, Number(row?.soldUnits) || 0),
    gmvRub: Math.max(0, Number(row?.gmvRub) || 0),
  };
}
