import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchStaffAuditLog } from "../api/fetchStaffAuditLog.js";
import { staffAuditLogQueryKeys } from "./staffAuditLogQueryKeys.js";

/**
 * @param {import('./types.js').StaffAuditLogFilters} [filters]
 * @param {{ enabled?: boolean }} [options]
 */
export function useStaffAuditLogQuery(filters = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: staffAuditLogQueryKeys.list(filters),
    queryFn: () => fetchStaffAuditLog(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}
