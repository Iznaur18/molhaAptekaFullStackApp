import { assertAtMostWords } from "./maxWordsText.js";

const PASSPORT_SERIES_RE = /^\d{4}$/;
const PASSPORT_NUMBER_RE = /^\d{6}$/;
const PASSPORT_DEPARTMENT_CODE_RE = /^\d{3}-\d{3}$/;
const NAME_MAX_LENGTH = 80;

/**
 * @param {Record<string, unknown>} raw
 * @returns {{
 *   lastName: string;
 *   firstName: string;
 *   middleName: string;
 *   birthDate: Date;
 *   series: string;
 *   number: string;
 *   issuedBy: string;
 *   issuedAt: Date;
 *   departmentCode: string;
 * }}
 */
export function normalizePassportPayload(raw) {
  const lastName = String(raw?.lastName ?? "").trim();
  const firstName = String(raw?.firstName ?? "").trim();
  const middleName = String(raw?.middleName ?? "").trim();
  const series = String(raw?.series ?? "").trim();
  const number = String(raw?.number ?? "").trim();
  const issuedBy = String(raw?.issuedBy ?? "").trim();
  const departmentCode = String(raw?.departmentCode ?? "").trim();

  if (!lastName || lastName.length > NAME_MAX_LENGTH) {
    throw new Error("Укажите фамилию");
  }
  if (!firstName || firstName.length > NAME_MAX_LENGTH) {
    throw new Error("Укажите имя");
  }
  if (middleName.length > NAME_MAX_LENGTH) {
    throw new Error("Некорректное отчество");
  }
  if (!PASSPORT_SERIES_RE.test(series)) {
    throw new Error("Серия паспорта: 4 цифры");
  }
  if (!PASSPORT_NUMBER_RE.test(number)) {
    throw new Error("Номер паспорта: 6 цифр");
  }
  if (!PASSPORT_DEPARTMENT_CODE_RE.test(departmentCode)) {
    throw new Error("Код подразделения: формат 000-000");
  }
  if (!issuedBy) {
    throw new Error("Укажите, кем выдан паспорт");
  }

  try {
    assertAtMostWords(issuedBy, "Кем выдан", 20);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Некорректное поле «кем выдан»");
  }

  const birthDate = parsePassportDate(raw?.birthDate, "Дата рождения");
  const issuedAt = parsePassportDate(raw?.issuedAt, "Дата выдачи");

  const today = startOfUtcDay(new Date());
  if (issuedAt > today) {
    throw new Error("Дата выдачи не может быть в будущем");
  }
  if (birthDate > today) {
    throw new Error("Некорректная дата рождения");
  }
  if (issuedAt < birthDate) {
    throw new Error("Дата выдачи не может быть раньше даты рождения");
  }

  return {
    lastName,
    firstName,
    middleName,
    birthDate,
    series,
    number,
    issuedBy,
    issuedAt,
    departmentCode,
  };
}

/**
 * @param {unknown} value
 * @param {string} label
 */
function parsePassportDate(value, label) {
  if (value == null || value === "") {
    throw new Error(`Укажите ${label.toLowerCase()}`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Некорректная ${label.toLowerCase()}`);
  }
  return startOfUtcDay(date);
}

/**
 * @param {Date} date
 */
function startOfUtcDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
