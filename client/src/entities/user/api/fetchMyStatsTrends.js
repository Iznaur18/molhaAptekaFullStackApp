import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /user/me/stats-trends`
 */
export async function fetchMyStatsTrends() {
  try {
    const { data } = await apiClient.get("/user/me/stats-trends");

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      windowHours: Number(data.data.windowHours) || 24,
      bucketCount: Number(data.data.bucketCount) || 24,
      followers: normalizeTrend(data.data.followers),
      sales: normalizeTrend(data.data.sales),
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_STATS_TRENDS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {unknown} raw
 */
function normalizeTrend(raw) {
  if (!raw || typeof raw !== "object") {
    return { percentChange: 0, series: [] };
  }
  const row = /** @type {{ percentChange?: unknown; series?: unknown }} */ (raw);
  const series = Array.isArray(row.series)
    ? row.series.map((n) => Math.max(0, Math.floor(Number(n)) || 0))
    : [];
  return {
    percentChange: Math.round(Number(row.percentChange)) || 0,
    series,
  };
}
