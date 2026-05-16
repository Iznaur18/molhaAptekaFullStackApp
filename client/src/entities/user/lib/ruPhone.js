import { RU_PHONE_MAX_DIGITS } from "../model/userConstants.js";

export const RU_PHONE_E164_REGEX = /^\+79\d{9}$/;

/** Разрешены только цифры и символы форматирования (+, пробел, скобки, дефис). */
const RU_PHONE_INPUT_CHAR = /[\d+\s()-]/;

/**
 * Убирает буквы и прочие символы; не даёт ввести больше {@link RU_PHONE_MAX_DIGITS} цифр.
 *
 * @param {unknown} raw
 * @returns {string}
 */
export function limitRuPhoneInput(raw) {
  if (raw == null || String(raw) === "") return "";
  const text = String(raw).replace(/[^\d+\s()-]/g, "");
  let digitCount = 0;
  let result = "";
  for (const ch of text) {
    if (!RU_PHONE_INPUT_CHAR.test(ch)) continue;
    if (/\d/.test(ch)) {
      if (digitCount >= RU_PHONE_MAX_DIGITS) continue;
      digitCount += 1;
    }
    result += ch;
  }
  return result;
}

/**
 * @param {unknown} raw
 * @returns {string | undefined}
 */
export function normalizeRuPhoneInput(raw) {
  if (raw == null) return undefined;
  const trimmed = String(raw).trim();
  if (trimmed === "") return undefined;

  let digits = trimmed.replace(/\D/g, "");
  if (digits.length > RU_PHONE_MAX_DIGITS) {
    throw new Error(
      `Номер не может содержать больше ${RU_PHONE_MAX_DIGITS} цифр`,
    );
  }
  if (digits === "") {
    throw new Error("Номер телефона должен содержать цифры");
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    digits = `7${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  return `+${digits}`;
}

/**
 * @param {string} normalized
 */
export function assertRuPhoneFormat(normalized) {
  if (typeof normalized !== "string") {
    throw new Error("Номер телефона должен быть строкой");
  }
  if (!RU_PHONE_E164_REGEX.test(normalized)) {
    throw new Error(
      "Номер РФ: +7 9XX XXX XX XX (можно 8…, 9XXXXXXXXX или с пробелами/скобками)",
    );
  }
}

/**
 * @param {unknown} raw
 * @returns {string | null} сообщение об ошибке или null
 */
export function validateRuPhoneField(raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return null;
  try {
    const normalized = normalizeRuPhoneInput(trimmed);
    assertRuPhoneFormat(normalized);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Неверный номер телефона";
  }
}
