import {
  buildAnalyticsCsvExport,
  getPlatformAnalyticsOverview,
  runAnalyticsReconciliation,
} from "../../services/analytics/index.js";
import { successRes } from "../../services/http/index.js";

/** GET /analytics/overview (admin) */
export async function getAnalyticsOverviewController(req, res) {
  const result = await getPlatformAnalyticsOverview(req.query);
  successRes(res, result);
}

/** GET /analytics/export (admin) — CSV + sha256 */
export async function getAnalyticsExportController(req, res) {
  const result = await buildAnalyticsCsvExport(req.query);
  successRes(res, result);
}

/** POST /analytics/reconciliation/run (admin) — ручной прогон сверки */
export async function runAnalyticsReconciliationController(_req, res) {
  const result = await runAnalyticsReconciliation();
  successRes(res, result);
}
