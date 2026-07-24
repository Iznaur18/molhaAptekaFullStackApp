/**
 * Константы журнала аудита staff-действий (модератор/админ).
 * Пишем только МУТАЦИИ (действия, меняющие данные), чтобы не засорять журнал
 * частыми чтениями очередей/счётчиков.
 */

/** HTTP-методы, считающиеся мутацией. Только они попадают в аудит. */
export const STAFF_AUDIT_MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

/**
 * Подстроки ключей, значения которых маскируются в снапшоте параметров/тела,
 * чтобы в журнал не попали секреты или ПДн (паспорт, селфи, токены).
 * Сравнение регистронезависимое, по вхождению подстроки.
 */
export const STAFF_AUDIT_REDACTED_KEY_PARTS = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "passport",
  "selfie",
  "photo",
  "series",
  "number",
];

/** Плейсхолдер вместо замаскированного значения. */
export const STAFF_AUDIT_REDACTED_PLACEHOLDER = "[redacted]";

/** Максимальная длина JSON-снапшота тела запроса (символы). */
export const STAFF_AUDIT_BODY_SNAPSHOT_MAX_CHARS = 2000;

/** Максимальная длина сохраняемого пути запроса (символы). */
export const STAFF_AUDIT_PATH_MAX_CHARS = 500;
