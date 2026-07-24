export const staffAuditLogQueryKeys = {
  all: ["staff-audit-log"],
  /**
   * @param {import('./types.js').StaffAuditLogFilters} filters
   */
  list: (filters) => ["staff-audit-log", "list", filters],
};
