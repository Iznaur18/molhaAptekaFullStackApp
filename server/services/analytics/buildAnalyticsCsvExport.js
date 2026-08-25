import { createHash } from "node:crypto";

import { getPlatformAnalyticsOverview } from "./getPlatformAnalyticsOverview.js";

/**
 * @param {{ period?: string }} query
 */
export async function buildAnalyticsCsvExport(query = {}) {
  const overview = await getPlatformAnalyticsOverview(query);
  const csv = buildCsvBody(overview);
  const sha256 = createHash("sha256").update(csv, "utf8").digest("hex");
  const periodKey = overview.period.key;
  const day = overview.asOf.slice(0, 10);

  return {
    asOf: overview.asOf,
    definitionsVersion: overview.definitionsVersion,
    period: overview.period,
    filename: `platform-analytics-${periodKey}-${day}.csv`,
    csv,
    sha256,
  };
}

/**
 * @param {Awaited<ReturnType<typeof getPlatformAnalyticsOverview>>} overview
 */
function buildCsvBody(overview) {
  const { metrics, period, reconciliation, asOf, definitionsVersion } = overview;
  const lines = [
    "key,value",
    csvRow("asOf", asOf),
    csvRow("definitionsVersion", definitionsVersion),
    csvRow("periodKey", period.key),
    csvRow("periodFrom", period.from ?? ""),
    csvRow("periodTo", period.to),
    csvRow("newUsers", metrics.newUsers),
    csvRow("publicationsCreated", metrics.publicationsCreated),
    csvRow("ordersCreated", metrics.ordersCreated),
    csvRow("soldUnits", metrics.soldUnits),
    csvRow("gmvRub", metrics.gmvRub),
    csvRow("productViewsUnique", metrics.productViewsUnique),
    csvRow("reconciliationOk", reconciliation?.ok ?? ""),
    csvRow("reconciliationRanAt", reconciliation?.ranAt ?? ""),
    csvRow(
      "soldQuantityMismatches",
      reconciliation?.soldQuantityMismatches ?? "",
    ),
    csvRow(
      "uniqueViewerCountMismatches",
      reconciliation?.uniqueViewerCountMismatches ?? "",
    ),
  ];
  return `${lines.join("\n")}\n`;
}

/**
 * @param {string} key
 * @param {string | number | boolean} value
 */
function csvRow(key, value) {
  return `${escapeCsv(key)},${escapeCsv(String(value))}`;
}

/** @param {string} value */
function escapeCsv(value) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
