/** Один токен: строчные латинские буквы и цифры (как ограничение «одно слово», без пробелов). */
export const USER_NAME_MIN_LENGTH = 3;
export const USER_NAME_MAX_LENGTH = 30;
const USER_NAME_REGEX = /^[a-z0-9]+$/;

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
  if (!USER_NAME_REGEX.test(normalized)) {
    throw new Error(
      "Никнейм: только строчные латинские буквы (a–z) и цифры (0–9), без пробелов и других символов",
    );
  }
}

/**
 * @param {unknown} raw
 * @returns {string | undefined} нормализованный ник или undefined, если пусто
 */
export function normalizeUserNameInput(raw) {
  if (raw == null) return undefined;
  const trimmed = String(raw).trim();
  if (trimmed === "") return undefined;
  return trimmed.toLowerCase();
}
