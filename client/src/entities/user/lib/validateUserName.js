import { assertUserNameFormat } from "@molha/api-contract";

/**
 * @param {unknown} raw
 * @param {{ required?: boolean }} [options]
 * @returns {string | null}
 */
export function validateUserNameField(raw, options = {}) {
  const { required = false } = options;
  const name = String(raw ?? "")
    .trim()
    .toLowerCase();

  if (name === "") {
    return required ? "Никнейм обязателен" : null;
  }

  try {
    assertUserNameFormat(name);
  } catch (error) {
    return error instanceof Error ? error.message : "Неверный никнейм";
  }

  return null;
}
