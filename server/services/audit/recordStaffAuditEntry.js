import { StaffAuditLogModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { buildStaffAuditEntry } from "./buildStaffAuditEntry.js";

/**
 * Пишет запись аудита staff-действия. Никогда не бросает исключений: аудит —
 * вспомогательная запись и не должен ломать или задерживать само действие
 * пользователя (вызывается fire-and-forget из `auditStaffActionMW`).
 *
 * @param {Parameters<typeof buildStaffAuditEntry>[0]} input
 * @returns {Promise<import("mongoose").Document | null>}
 */
export async function recordStaffAuditEntry(input) {
  const entry = buildStaffAuditEntry(input);
  if (!entry) {
    return null;
  }
  try {
    return await StaffAuditLogModel.create(entry);
  } catch (error) {
    logServerEvent("error", {
      event: "staff_audit_write_failed",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
