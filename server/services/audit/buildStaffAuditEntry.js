import {
  STAFF_AUDIT_BODY_SNAPSHOT_MAX_CHARS,
  STAFF_AUDIT_MUTATING_METHODS,
  STAFF_AUDIT_REDACTED_KEY_PARTS,
  STAFF_AUDIT_REDACTED_PLACEHOLDER,
} from "../../constants/staffAuditConstants.js";

/** true, если метод меняет данные (и потому подлежит аудиту). */
export const isStaffAuditMutatingMethod = (method) =>
  STAFF_AUDIT_MUTATING_METHODS.includes(String(method ?? "").toUpperCase());

const isRedactedKey = (key) => {
  const lower = String(key).toLowerCase();
  return STAFF_AUDIT_REDACTED_KEY_PARTS.some((part) => lower.includes(part));
};

const redactValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }
  if (value && typeof value === "object") {
    return redactObject(value);
  }
  return value;
};

/** Рекурсивно маскирует значения чувствительных ключей, структуру сохраняет. */
const redactObject = (obj) => {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = isRedactedKey(key)
      ? STAFF_AUDIT_REDACTED_PLACEHOLDER
      : redactValue(value);
  }
  return out;
};

const buildBodySnapshot = (body) => {
  if (body == null || typeof body !== "object" || Object.keys(body).length === 0) {
    return null;
  }
  const redacted = redactObject(body);
  const json = JSON.stringify(redacted);
  if (json.length <= STAFF_AUDIT_BODY_SNAPSHOT_MAX_CHARS) {
    return redacted;
  }
  return {
    _truncated: true,
    preview: json.slice(0, STAFF_AUDIT_BODY_SNAPSHOT_MAX_CHARS),
  };
};

/**
 * Собирает запись аудита из данных запроса. Чистая функция (без БД/побочек),
 * чтобы её можно было юнит-тестировать.
 *
 * @param {{
 *   method: string;
 *   action: string;
 *   path: string;
 *   params?: Record<string, unknown>;
 *   body?: unknown;
 *   actorUserId: unknown;
 *   actorRole?: string;
 *   statusCode: number;
 *   requestId?: string | null;
 * }} input
 * @returns {object | null} запись для записи в БД, либо null если это не мутация
 *   или нет актора.
 */
export function buildStaffAuditEntry({
  method,
  action,
  path,
  params,
  body,
  actorUserId,
  actorRole,
  statusCode,
  requestId,
}) {
  if (!isStaffAuditMutatingMethod(method)) {
    return null;
  }
  if (!actorUserId) {
    return null;
  }

  const hasParams = params && typeof params === "object" && Object.keys(params).length > 0;

  return {
    actorUserId,
    actorRole: actorRole ?? "",
    method: String(method).toUpperCase(),
    action,
    path,
    params: hasParams ? redactObject(params) : {},
    requestBody: buildBodySnapshot(body),
    statusCode,
    requestId: requestId ?? null,
  };
}
