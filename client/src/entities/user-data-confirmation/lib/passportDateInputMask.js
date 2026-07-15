/**
 * Маска ввода паспорта: только цифры → ДД.ММ.ГГГГ с автоточками.
 * @param {string} raw
 */
export function maskPassportDateInput(raw) {
  const digits = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}.${month}`;
  return `${day}.${month}.${year}`;
}

/**
 * ДД.ММ.ГГГГ → YYYY-MM-DD, либо null.
 * @param {string} masked
 * @returns {string | null}
 */
export function parsePassportDateInputToIso(masked) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(masked ?? "").trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * @param {string} masked
 */
export function isPassportDateInputComplete(masked) {
  return parsePassportDateInputToIso(masked) != null;
}
