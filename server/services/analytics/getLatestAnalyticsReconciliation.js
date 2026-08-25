import { AnalyticsReconciliationModel } from "../../models/index.js";

/** @returns {Promise<object | null>} */
export async function getLatestAnalyticsReconciliation() {
  const doc = await AnalyticsReconciliationModel.findOne({})
    .sort({ ranAt: -1 })
    .lean();

  if (!doc) {
    return null;
  }

  return {
    dayKey: doc.dayKey,
    ranAt: doc.ranAt?.toISOString?.() ?? null,
    ok: doc.ok === true,
    soldQuantityMismatches: Number(doc.soldQuantityMismatches) || 0,
    uniqueViewerCountMismatches: Number(doc.uniqueViewerCountMismatches) || 0,
    productsChecked: Number(doc.productsChecked) || 0,
    soldMismatchSamples: doc.soldMismatchSamples ?? [],
    viewerMismatchSamples: doc.viewerMismatchSamples ?? [],
  };
}
