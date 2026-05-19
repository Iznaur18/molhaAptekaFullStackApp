import { REGISTER_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} password
 * @param {string} passwordConfirm
 * @returns {string | null}
 */
export function validatePasswordConfirm(password, passwordConfirm) {
  const pwd = String(password ?? "");
  const confirm = String(passwordConfirm ?? "");

  if (pwd.length < REGISTER_MODAL_UI.PASSWORD_MIN_LENGTH) {
    return REGISTER_MODAL_UI.ERROR_PASSWORD_TOO_SHORT;
  }

  if (pwd !== confirm) {
    return REGISTER_MODAL_UI.ERROR_PASSWORD_MISMATCH;
  }

  return null;
}
