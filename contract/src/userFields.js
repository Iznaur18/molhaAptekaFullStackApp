import { z } from "zod";

/** Синхрон с `server/validations/user/userNameRules.js`. */
export const USER_NAME_MIN_LENGTH = 3;
export const USER_NAME_MAX_LENGTH = 30;
const USER_NAME_CHAR_REGEX = /^[a-z0-9._]+$/;
const USER_NAME_HAS_ALNUM = /[a-z0-9]/;
export const USER_NAME_FORMAT_ERROR =
  "Никнейм: a–z, 0–9, точка и подчёркивание; точка не в начале/конце и не подряд (..); нужна хотя бы одна буква или цифра";

/** Синхрон с `server/validations/user/ruPhoneRules.js`. */
export const RU_PHONE_E164_REGEX = /^\+79\d{9}$/;
export const RU_PHONE_MAX_DIGITS = 11;
/** Display / empty placeholder (UI). Storage остаётся E.164. */
export const RU_PHONE_EMPTY_LABEL = "не указан";
const RU_PHONE_LOCAL_DIGITS = 10;

export const USER_GENDER_VALUES = ["male", "female", "noSelected"];

/** Синхрон с `server/constants/userBackgroundPresets.js`. */
export const USER_BACKGROUND_PRESET_IDS = [
  "steel",
  "gold",
  "grape",
  "teal",
  "leaf",
  "mist",
  "ink",
];

/** Синхрон с `server/constants/dadataConstants.js`. */
export const ADDRESS_LINE_MAX_LENGTH = 100;
export const ADDRESS_FLAT_MAX_LENGTH = 20;

/**
 * Цифры для маски ввода: ведущая `8`, максимум 11.
 * @param {unknown} raw
 * @returns {string}
 */
function digitsForRuPhoneMask(raw) {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("7")) {
    digits = `8${digits.slice(1)}`;
  } else if (digits.length > 0 && digits.startsWith("9")) {
    digits = `8${digits}`;
  }
  return digits.slice(0, RU_PHONE_MAX_DIGITS);
}

/**
 * As-you-type: `8 (912) 345-67-89`.
 * @param {unknown} raw
 * @returns {string}
 */
export function maskRuPhoneInput(raw) {
  const digits = digitsForRuPhoneMask(raw);
  if (digits === "") return "";

  let result = digits[0] ?? "";
  const local = digits.slice(1, 1 + RU_PHONE_LOCAL_DIGITS);
  if (local.length === 0) return result;

  result += ` (${local.slice(0, 3)}`;
  if (local.length <= 3) return result;

  result += `) ${local.slice(3, 6)}`;
  if (local.length <= 6) return result;

  result += `-${local.slice(6, 8)}`;
  if (local.length <= 8) return result;

  return `${result}-${local.slice(8, 10)}`;
}

/**
 * Pretty display без empty-label. Пустой / без цифр → `""`.
 * @param {unknown} raw
 * @returns {string}
 */
export function formatRuPhoneDisplay(raw) {
  if (raw == null || String(raw).trim() === "") return "";
  return maskRuPhoneInput(raw);
}

/**
 * Pretty или {@link RU_PHONE_EMPTY_LABEL}.
 * @param {unknown} raw
 * @returns {string}
 */
export function formatRuPhoneDisplayOrEmpty(raw) {
  return formatRuPhoneDisplay(raw) || RU_PHONE_EMPTY_LABEL;
}

/**
 * `tel:+79…` только для валидного E.164, иначе `null`.
 * @param {unknown} raw
 * @returns {string | null}
 */
export function toRuPhoneTelHref(raw) {
  if (raw == null || String(raw).trim() === "") return null;
  try {
    const normalized = normalizeRuPhoneInput(raw);
    if (normalized && RU_PHONE_E164_REGEX.test(normalized)) {
      return `tel:${normalized}`;
    }
  } catch {
    return null;
  }
  return null;
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
  if (digits === "") {
    throw new Error("Номер телефона должен содержать цифры");
  }
  if (digits.length > RU_PHONE_MAX_DIGITS) {
    throw new Error(`Номер не может содержать больше ${RU_PHONE_MAX_DIGITS} цифр`);
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
  } catch (error) {
    return error instanceof Error ? error.message : "Неверный номер телефона";
  }
}

/**
 * @param {unknown} raw
 * @returns {string | undefined}
 */
export function normalizeUserNameInput(raw) {
  if (raw == null) return undefined;
  const trimmed = String(raw).trim();
  if (trimmed === "") return undefined;
  return trimmed.toLowerCase();
}

/**
 * Live input sanitize: lower case + только a–z 0–9 `.` `_`.
 * @param {unknown} raw
 * @returns {string}
 */
export function sanitizeUserNameInputLive(raw) {
  return String(raw ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "");
}

/**
 * @param {string} normalized — уже trim + lowerCase
 */
export function assertUserNameFormat(normalized) {
  if (typeof normalized !== "string") {
    throw new Error("Никнейм должен быть строкой");
  }
  if (normalized.length < USER_NAME_MIN_LENGTH) {
    throw new Error(`Никнейм не короче ${USER_NAME_MIN_LENGTH} символов`);
  }
  if (normalized.length > USER_NAME_MAX_LENGTH) {
    throw new Error(`Никнейм не длиннее ${USER_NAME_MAX_LENGTH} символов`);
  }
  if (
    !USER_NAME_CHAR_REGEX.test(normalized) ||
    normalized.startsWith(".") ||
    normalized.endsWith(".") ||
    normalized.includes("..") ||
    !USER_NAME_HAS_ALNUM.test(normalized)
  ) {
    throw new Error(USER_NAME_FORMAT_ERROR);
  }
}

export const userNameFieldSchema = z
  .string({ required_error: "Никнейм обязателен" })
  .trim()
  .min(1, "Никнейм обязателен")
  .transform((value) => value.toLowerCase())
  .superRefine((value, ctx) => {
    try {
      assertUserNameFormat(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Неверный никнейм",
      });
    }
  });

export const ruPhoneOptionalFieldSchema = z
  .union([z.string(), z.literal(""), z.null(), z.undefined()])
  .optional()
  .transform((raw, ctx) => {
    if (raw == null || raw === "") return undefined;
    try {
      const normalized = normalizeRuPhoneInput(raw);
      if (!RU_PHONE_E164_REGEX.test(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Номер РФ: +7 9XX XXX XX XX (можно 8…, 9XXXXXXXXX или с пробелами/скобками)",
        });
        return z.NEVER;
      }
      return normalized;
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Неверный номер телефона",
      });
      return z.NEVER;
    }
  });

/** Обязательный РФ-мобильный номер → E.164 `+79…`. */
export const ruPhoneRequiredFieldSchema = z
  .string({ required_error: "Номер телефона обязателен" })
  .trim()
  .min(1, "Номер телефона обязателен")
  .transform((raw, ctx) => {
    try {
      const normalized = normalizeRuPhoneInput(raw);
      if (!normalized || !RU_PHONE_E164_REGEX.test(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Номер РФ: +7 9XX XXX XX XX (можно 8…, 9XXXXXXXXX или с пробелами/скобками)",
        });
        return z.NEVER;
      }
      return normalized;
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Неверный номер телефона",
      });
      return z.NEVER;
    }
  });

export const userGenderFieldSchema = z.enum(USER_GENDER_VALUES).optional();

export const userBackgroundPresetFieldSchema = z
  .enum(USER_BACKGROUND_PRESET_IDS)
  .optional()
  .or(z.literal(""))
  .or(z.null())
  .optional();

export const deliveryAddressLineFieldSchema = z
  .string()
  .trim()
  .max(ADDRESS_LINE_MAX_LENGTH, `Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`)
  .optional()
  .or(z.literal(""))
  .or(z.null())
  .optional();

export const deliveryAddressFlatFieldSchema = z
  .string()
  .trim()
  .max(ADDRESS_FLAT_MAX_LENGTH)
  .optional()
  .or(z.literal(""))
  .or(z.null())
  .optional();
