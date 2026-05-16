import {
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
} from "../model/userConstants.js";

const USER_NAME_PATTERN = /^[a-z0-9]+$/;

/**
 * @param {unknown} raw
 * @param {{ required?: boolean }} [options]
 * @returns {string | null}
 */
export function validateUserNameField(raw, options = {}) {
  const { required = false } = options;
  const name = String(raw ?? "").trim().toLowerCase();

  if (name === "") {
    return required ? "Никнейм обязателен" : null;
  }

  if (name.length < USER_NAME_MIN_LENGTH || name.length > USER_NAME_MAX_LENGTH) {
    return `Никнейм: от ${USER_NAME_MIN_LENGTH} до ${USER_NAME_MAX_LENGTH} символов`;
  }

  if (!USER_NAME_PATTERN.test(name)) {
    return "Никнейм: только a–z и 0–9, без пробелов";
  }

  return null;
}
