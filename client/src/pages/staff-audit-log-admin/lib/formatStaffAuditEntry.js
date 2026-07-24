/**
 * @param {string | null} iso
 * @returns {string}
 */
export function formatStaffAuditTime(iso) {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * @param {import('../../../entities/staff-audit-log/model/types.js').StaffAuditActor | null} actor
 * @returns {string}
 */
export function formatStaffAuditActor(actor) {
  if (!actor) {
    return "—";
  }
  return actor.userName?.trim() || actor.email?.trim() || "—";
}

/**
 * Тон бейджа статуса: 2xx — успех, 4xx — предупреждение, иначе ошибка.
 * @param {number} statusCode
 * @returns {"ok" | "warn" | "error"}
 */
export function staffAuditStatusTone(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return "ok";
  }
  if (statusCode >= 400 && statusCode < 500) {
    return "warn";
  }
  return "error";
}
