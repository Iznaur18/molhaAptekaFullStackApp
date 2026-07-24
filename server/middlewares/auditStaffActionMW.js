import { recordStaffAuditEntry } from "../services/audit/index.js";
import { STAFF_AUDIT_PATH_MAX_CHARS } from "../constants/staffAuditConstants.js";

/**
 * Сквозной аудит staff-мутаций. Ставится глобально ДО роутеров: вешает слушатель
 * на `res.finish` и после ответа пишет запись, если запрос прошёл через staff-гейт
 * — `req.staffAudit` выставляется в `checkAdminMW` / `checkProductModeratorMW`.
 *
 * Запись идёт fire-and-forget и только для мутаций (POST/PUT/PATCH/DELETE, фильтр
 * внутри `buildStaffAuditEntry`), поэтому не влияет на ответ и не логирует частые
 * чтения очередей/счётчиков.
 *
 * @type {import('express').RequestHandler}
 */
export function auditStaffActionMW(req, res, next) {
  res.on("finish", () => {
    const staffAudit = req.staffAudit;
    if (!staffAudit) {
      return;
    }

    const routePath = req.route?.path ?? req.path;
    const action = `${req.method.toUpperCase()} ${req.baseUrl}${routePath}`;

    void recordStaffAuditEntry({
      method: req.method,
      action,
      path: String(req.originalUrl).slice(0, STAFF_AUDIT_PATH_MAX_CHARS),
      params: req.params ?? {},
      body: req.body ?? null,
      actorUserId: req.userId,
      actorRole: staffAudit.role,
      statusCode: res.statusCode,
      requestId: req.requestId,
    });
  });

  next();
}
