import { ANALYTICS_RECONCILIATION_MISMATCH_SAMPLE_LIMIT } from "../../constants/analyticsConstants.js";
import {
  AnalyticsReconciliationModel,
  ProductModel,
  ProductViewModel,
} from "../../models/index.js";
import { aggregateSoldQuantityRowsFromOrders } from "../product/productSoldQuantityDenorm.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Сверка denorm ↔ primary. Пишет snapshot + structured log.
 * @returns {Promise<object>}
 */
export async function runAnalyticsReconciliation() {
  const ranAt = new Date();
  const dayKey = ranAt.toISOString().slice(0, 10);

  try {
    const [soldRows, viewerRows, products] = await Promise.all([
      aggregateSoldQuantityRowsFromOrders(),
      aggregateViewerCountsFromProductViews(),
      ProductModel.find({}).select("_id soldQuantity uniqueViewerCount").lean(),
    ]);

    const soldById = new Map(
      soldRows.map((row) => [
        String(row._id),
        Math.max(0, Number(row.soldQuantity) || 0),
      ]),
    );
    const viewersById = new Map(
      viewerRows.map((row) => [
        String(row._id),
        Math.max(0, Number(row.viewerCount) || 0),
      ]),
    );

    const soldMismatchSamples = [];
    const viewerMismatchSamples = [];
    let soldQuantityMismatches = 0;
    let uniqueViewerCountMismatches = 0;

    for (const product of products) {
      const id = String(product._id);
      const expectedSold = soldById.get(id) ?? 0;
      const actualSold = Math.max(0, Number(product.soldQuantity) || 0);
      if (expectedSold !== actualSold) {
        soldQuantityMismatches += 1;
        pushSample(soldMismatchSamples, id, expectedSold, actualSold);
      }

      const expectedViews = viewersById.get(id) ?? 0;
      const actualViews = Math.max(0, Number(product.uniqueViewerCount) || 0);
      if (expectedViews !== actualViews) {
        uniqueViewerCountMismatches += 1;
        pushSample(viewerMismatchSamples, id, expectedViews, actualViews);
      }
    }

    const ok =
      soldQuantityMismatches === 0 && uniqueViewerCountMismatches === 0;

    const snapshot = {
      dayKey,
      ranAt,
      ok,
      soldQuantityMismatches,
      uniqueViewerCountMismatches,
      productsChecked: products.length,
      soldMismatchSamples,
      viewerMismatchSamples,
    };

    await AnalyticsReconciliationModel.findOneAndUpdate(
      { dayKey },
      { $set: snapshot },
      { upsert: true, new: true },
    );

    logServerEvent(ok ? "info" : "warn", {
      event: "analytics.reconciliation",
      dayKey,
      ok,
      soldQuantityMismatches,
      uniqueViewerCountMismatches,
      productsChecked: products.length,
    });

    return {
      ...snapshot,
      ranAt: ranAt.toISOString(),
    };
  } catch (error) {
    logServerEvent("error", {
      event: "analytics.reconciliation_failed",
      dayKey,
      ...formatLogError(error),
    });
    throw error;
  }
}

async function aggregateViewerCountsFromProductViews() {
  return ProductViewModel.aggregate([
    {
      $group: {
        _id: "$productId",
        viewerCount: { $sum: 1 },
      },
    },
  ]);
}

/**
 * @param {Array<{ productId: string; expected: number; actual: number }>} samples
 * @param {string} productId
 * @param {number} expected
 * @param {number} actual
 */
function pushSample(samples, productId, expected, actual) {
  if (samples.length >= ANALYTICS_RECONCILIATION_MISMATCH_SAMPLE_LIMIT) {
    return;
  }
  samples.push({ productId, expected, actual });
}
