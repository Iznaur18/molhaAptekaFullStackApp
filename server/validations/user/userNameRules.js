/** Никнейм как в Instagram: a–z, 0–9, `.` и `_` (одно «слово», без пробелов). */
export const USER_NAME_MIN_LENGTH = 3;
export const USER_NAME_MAX_LENGTH = 30;

const USER_NAME_CHAR_REGEX = /^[a-z0-9._]+$/;
const USER_NAME_HAS_ALNUM = /[a-z0-9]/;

export const USER_NAME_FORMAT_ERROR =
  "Никнейм: a–z, 0–9, точка и подчёркивание; точка не в начале/конце и не подряд (..); нужна хотя бы одна буква или цифра";

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
