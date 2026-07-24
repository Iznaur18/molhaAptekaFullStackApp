import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import('../model/types.js').StaffAuditLogFilters} [filters]
 * @returns {Promise<import('../model/types.js').StaffAuditLogPage>}
 */
export async function fetchStaffAuditLog(filters = {}) {
  try {
    const params = {};
    if (filters.page) params.page = filters.page;
    if (filters.actorUserId) params.actorUserId = filters.actorUserId;
    if (filters.action) params.action = filters.action;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    const { data } = await apiClient.get("/audit/staff-log", { params });
    if (!data?.success || !Array.isArray(data.data?.items)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить журнал аудита";
    throw new Error(message);
  }
}
