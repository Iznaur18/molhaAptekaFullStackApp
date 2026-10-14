const DATE_TIME_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** @param {number} value */
const pad = (value) => String(value).padStart(2, "0");

/**
 * «14 октября, 18:30» по часам пользователя.
 *
 * @param {string | null | undefined} iso
 */
export function formatDealRequestTime(iso) {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? DATE_TIME_FORMAT.format(date) : "";
}

/**
 * Значение для `<input type="datetime-local">` в местном времени.
 *
 * `toISOString()` тут не годится: он отдаёт UTC, и поле показало бы время со
 * сдвигом на часовой пояс.
 *
 * @param {Date | string | null | undefined} value
 */
export function toDateTimeLocalValue(value) {
  const date = value instanceof Date ? value : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Строка из `datetime-local` → ISO для сервера; пустая или битая — `null`.
 *
 * @param {string} value
 */
export function fromDateTimeLocalValue(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Завтра в 12:00 — время, которое не окажется в прошлом, пока форму заполняют.
 *
 * @param {Date} [now]
 */
export function defaultDealRequestTime(now = new Date()) {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(12, 0, 0, 0);
  return next;
}
