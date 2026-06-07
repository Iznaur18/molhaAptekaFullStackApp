import { z } from "zod";

/** Синхрон с `server/validations/user/userNameRules.js`. */
export const USER_NAME_MIN_LENGTH = 3;
export const USER_NAME_MAX_LENGTH = 30;
const USER_NAME_REGEX = /^[a-z0-9]+$/;

/** Синхрон с `server/validations/user/ruPhoneRules.js`. */
export const RU_PHONE_E164_REGEX = /^\+79\d{9}$/;
export const RU_PHONE_MAX_DIGITS = 11;

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
 * @param {string} normalized
 */
function assertUserNameFormat(normalized) {
  if (normalized.length < USER_NAME_MIN_LENGTH) {
    throw new Error(`Никнейм не короче ${USER_NAME_MIN_LENGTH} символов`);
  }
  if (normalized.length > USER_NAME_MAX_LENGTH) {
    throw new Error(`Никнейм не длиннее ${USER_NAME_MAX_LENGTH} символов`);
  }
  if (!USER_NAME_REGEX.test(normalized)) {
    throw new Error(
      "Никнейм: только строчные латинские буквы (a–z) и цифры (0–9), без пробелов и других символов",
    );
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
