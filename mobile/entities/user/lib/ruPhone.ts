import { RU_PHONE_E164_REGEX, RU_PHONE_MAX_DIGITS } from "@/entities/user/model/constants";

const RU_PHONE_INPUT_CHAR = /[\d+\s()-]/;

export const limitRuPhoneInput = (raw: unknown): string => {
  if (raw == null || String(raw) === "") {
    return "";
  }
  const text = String(raw).replace(/[^\d+\s()-]/g, "");
  let digitCount = 0;
  let result = "";
  for (const ch of text) {
    if (!RU_PHONE_INPUT_CHAR.test(ch)) {
      continue;
    }
    if (/\d/.test(ch)) {
      if (digitCount >= RU_PHONE_MAX_DIGITS) {
        continue;
      }
      digitCount += 1;
    }
    result += ch;
  }
  return result;
};

export const normalizeRuPhoneInput = (raw: unknown): string | undefined => {
  if (raw == null) {
    return undefined;
  }
  const trimmed = String(raw).trim();
  if (trimmed === "") {
    return undefined;
  }

  let digits = trimmed.replace(/\D/g, "");
  if (digits.length > RU_PHONE_MAX_DIGITS) {
    throw new Error(`Номер не может содержать больше ${RU_PHONE_MAX_DIGITS} цифр`);
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
};

const assertRuPhoneFormat = (normalized: string) => {
  if (!RU_PHONE_E164_REGEX.test(normalized)) {
    throw new Error(
      "Номер РФ: +7 9XX XXX XX XX (можно 8…, 9XXXXXXXXX или с пробелами/скобками)",
    );
  }
};

export const validateRuPhoneField = (raw: unknown): string | null => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") {
    return null;
  }
  try {
    const normalized = normalizeRuPhoneInput(trimmed);
    assertRuPhoneFormat(normalized ?? "");
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Неверный номер телефона";
  }
};
