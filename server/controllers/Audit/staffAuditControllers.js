import { listStaffAuditEntries } from "../../services/audit/index.js";
import { successRes } from "../../services/http/index.js";

/** GET /audit/staff-log (admin) — журнал действий сотрудников. */
export async function listStaffAuditLogController(req, res) {
  const result = await listStaffAuditEntries(req.query);
  successRes(res, result);
}
