/** Маска ввода даты рождения: только цифры → ДД.ММ.ГГГГ. */
export const maskBirthDateInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) {
    return day;
  }
  if (digits.length <= 4) {
    return `${day}.${month}`;
  }
  return `${day}.${month}.${year}`;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const buildIsoDate = (year: number, month: number, day: number): string | null => {
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    year < 1 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const utcMs = Date.UTC(year, month - 1, day);
  if (!Number.isFinite(utcMs)) {
    return null;
  }

  const utc = new Date(utcMs);
  if (
    Number.isNaN(utc.getTime()) ||
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
};

const coerceToIsoDateString = (value: unknown): string => {
  if (value == null || value === "") {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }
    try {
      return value.toISOString();
    } catch {
      return "";
    }
  }

  return "";
};

/** ISO / Date → ДД.ММ.ГГГГ для поля формы. */
export const formatBirthDateForInput = (value: unknown): string => {
  const raw = coerceToIsoDateString(value);
  if (raw.length < 10) {
    return "";
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (isoMatch) {
    return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  }

  const dottedMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw);
  if (dottedMatch) {
    return raw;
  }

  return "";
};

/**
 * ДД.ММ.ГГГГ или YYYY-MM-DD → YYYY-MM-DD, либо null если дата неполная/невалидная.
 * Никогда не зовёт toISOString — на Hermes Invalid Date даёт RangeError.
 */
export const parseBirthDateInputToIsoDate = (masked: string): string | null => {
  const trimmed = masked.trim();

  const dotted = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  if (dotted) {
    return buildIsoDate(Number(dotted[3]), Number(dotted[2]), Number(dotted[1]));
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    return buildIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  return null;
};

export const isBirthDateInputComplete = (masked: string): boolean =>
  parseBirthDateInputToIsoDate(masked) != null;

/** YYYY-MM-DD → ISO datetime noon UTC for API (без Date#toISOString). */
export const birthDateIsoDateToApiValue = (isoDate: string): string =>
  `${isoDate}T12:00:00.000Z`;
