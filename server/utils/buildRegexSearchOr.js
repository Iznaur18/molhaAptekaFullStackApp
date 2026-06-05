/**
 * Экранирует спецсимволы regex в пользовательском вводе (защита от ReDoS).
 *
 * @param {string} input
 * @returns {string}
 */
export const escapeRegexSpecialCharsInUserInput = (input) =>
  input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Собирает условие $or с regex по заданным полям. Если term пустой — возвращает null.
 *
 * @param {string} rawTerm
 * @param {string[]} fieldNames
 * @returns {Record<string, unknown> | null}
 */
export const buildRegexSearchOr = (rawTerm, fieldNames) => {
  if (typeof rawTerm !== "string") return null;

  const trimmedTerm = rawTerm.trim();
  if (!trimmedTerm || fieldNames.length === 0) return null;

  const escapedTerm = escapeRegexSpecialCharsInUserInput(trimmedTerm);
  const regexCondition = { $regex: escapedTerm, $options: "i" };

  return {
    $or: fieldNames.map((fieldName) => ({ [fieldName]: regexCondition })),
  };
};
