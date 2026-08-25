import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ period?: string }} [params]
 * @returns {Promise<object>}
 */
export async function fetchAdminAnalyticsOverview(params = {}) {
  try {
    const { data } = await apiClient.get("/analytics/overview", {
      params: { period: params.period },
    });
    if (!data?.success || !data.data?.metrics) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить аналитику";
    throw new Error(message);
  }
}

/**
 * @param {{ period?: string }} [params]
 * @returns {Promise<{ csv: string; sha256: string; filename: string; asOf: string }>}
 */
export async function fetchAdminAnalyticsExport(params = {}) {
  try {
    const { data } = await apiClient.get("/analytics/export", {
      params: { period: params.period },
    });
    if (!data?.success || typeof data.data?.csv !== "string") {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось скачать отчёт";
    throw new Error(message);
  }
}

/** @returns {Promise<object>} */
export async function runAdminAnalyticsReconciliation() {
  try {
    const { data } = await apiClient.post("/analytics/reconciliation/run");
    if (!data?.success || typeof data.data?.ok !== "boolean") {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось запустить сверку";
    throw new Error(message);
  }
}
