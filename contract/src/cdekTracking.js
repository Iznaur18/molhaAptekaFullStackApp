/**
 * Этап посылки СДЭК так, как его показывает сам СДЭК на cdek.ru.
 *
 * API отдаёт десятки внутренних статусов («Принят на склад транзита»,
 * «Сдан перевозчику в г. отправителе»…), а покупатель и продавец видят на
 * сайте СДЭК четыре шага: «Создан» → «В пути» → «Готов к выдаче» → «Вручён».
 * Раньше мы показывали сырое название из API, и оно расходилось с тем, что
 * человек видел у СДЭК: там «Готов к выдаче», у нас «Принят на склад до
 * востребования». Коды — apidoc СДЭК v2, раздел «Статусы заказа».
 */

export const CDEK_STAGE_CREATED = "created";
export const CDEK_STAGE_IN_TRANSIT = "in_transit";
export const CDEK_STAGE_WITH_COURIER = "with_courier";
export const CDEK_STAGE_READY_FOR_PICKUP = "ready_for_pickup";
export const CDEK_STAGE_DELIVERED = "delivered";
export const CDEK_STAGE_NOT_DELIVERED = "not_delivered";
export const CDEK_STAGE_RETURNING = "returning";
export const CDEK_STAGE_CANCELLED = "cancelled";
export const CDEK_STAGE_INVALID = "invalid";

export const CDEK_STAGE_LABEL_RU = {
  [CDEK_STAGE_CREATED]: "Создан",
  [CDEK_STAGE_IN_TRANSIT]: "В пути",
  [CDEK_STAGE_WITH_COURIER]: "Передан курьеру",
  [CDEK_STAGE_READY_FOR_PICKUP]: "Готов к выдаче",
  [CDEK_STAGE_DELIVERED]: "Вручён",
  [CDEK_STAGE_NOT_DELIVERED]: "Не вручён",
  [CDEK_STAGE_RETURNING]: "Возврат отправителю",
  [CDEK_STAGE_CANCELLED]: "Отменён",
  [CDEK_STAGE_INVALID]: "Ошибка в накладной",
};

/** Посылка ещё у продавца: накладная есть, СДЭК её не принял. */
const CREATED_CODES = new Set(["ACCEPTED", "CREATED"]);
/** Лежит в пункте выдачи или постамате — ждёт покупателя. */
const READY_CODES = new Set(["ACCEPTED_AT_PICK_UP_POINT", "POSTOMAT_POSTED"]);
const WITH_COURIER_CODES = new Set(["TAKEN_BY_COURIER"]);
const DELIVERED_CODES = new Set(["DELIVERED", "POSTOMAT_RECEIVED"]);
const NOT_DELIVERED_CODES = new Set(["NOT_DELIVERED"]);
const RETURNING_CODES = new Set([
  "RETURNED_TO_SENDER_CITY_WAREHOUSE",
  "RETURNED_TO_RECIPIENT_CITY_WAREHOUSE",
  "RETURNED_TO_TRANSIT_WAREHOUSE",
  "RETURNED",
  "POSTOMAT_SEIZED",
]);
const CANCELLED_CODES = new Set(["REMOVED", "CANCELED", "CANCELLED"]);
const INVALID_CODES = new Set(["INVALID"]);

/**
 * @param {string | null | undefined} statusCode код статуса СДЭК
 * @returns {string | null} этап; `null` — статуса ещё нет
 */
export function resolveCdekStage(statusCode) {
  const code = String(statusCode ?? "").trim();
  if (!code) return null;
  if (CREATED_CODES.has(code)) return CDEK_STAGE_CREATED;
  if (READY_CODES.has(code)) return CDEK_STAGE_READY_FOR_PICKUP;
  if (WITH_COURIER_CODES.has(code)) return CDEK_STAGE_WITH_COURIER;
  if (DELIVERED_CODES.has(code)) return CDEK_STAGE_DELIVERED;
  if (NOT_DELIVERED_CODES.has(code)) return CDEK_STAGE_NOT_DELIVERED;
  if (RETURNING_CODES.has(code)) return CDEK_STAGE_RETURNING;
  if (CANCELLED_CODES.has(code)) return CDEK_STAGE_CANCELLED;
  if (INVALID_CODES.has(code)) return CDEK_STAGE_INVALID;
  // Все прочие — склады, перевозчики, сортировки: для человека это «в пути».
  return CDEK_STAGE_IN_TRANSIT;
}

/**
 * Подпись этапа; без кода — `fallback` (например, сырое название из API).
 *
 * @param {string | null | undefined} statusCode
 * @param {string} [fallback]
 * @returns {string}
 */
export function formatCdekStageLabel(statusCode, fallback = "") {
  const stage = resolveCdekStage(statusCode);
  return stage ? CDEK_STAGE_LABEL_RU[stage] : fallback;
}

const MONTHS_GENITIVE_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];
const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * «3 октября» — день по Москве, до которого посылка бесплатно лежит в пункте.
 *
 * СДЭК отдаёт конец дня по Москве в UTC (`2026-10-03T20:59:59Z`), поэтому
 * день считаем в МСК, а не в поясе телефона. Без Intl: в Hermes он неполный.
 *
 * @param {string | Date | null | undefined} value
 * @returns {string} пусто, если даты нет или она битая
 */
export function formatCdekKeepFreeUntil(value) {
  if (!value) return "";
  const ms = value instanceof Date ? value.getTime() : Date.parse(String(value));
  if (!Number.isFinite(ms)) return "";
  const moscow = new Date(ms + MOSCOW_OFFSET_MS);
  return `${moscow.getUTCDate()} ${MONTHS_GENITIVE_RU[moscow.getUTCMonth()]}`;
}

/**
 * Посылка ждёт покупателя в пункте — время показывать срок хранения.
 *
 * @param {string | null | undefined} statusCode
 * @returns {boolean}
 */
export function isCdekAwaitingPickup(statusCode) {
  return resolveCdekStage(statusCode) === CDEK_STAGE_READY_FOR_PICKUP;
}
