import {
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  USER_GENDER_NO_SELECTED,
} from "../model/userConstants.js";

/**
 * @param {{
 *   email: string;
 *   password: string;
 *   passwordConfirm: string;
 *   userName: string;
 * }} form
 * @returns {import('../model/types.js').RegisterUserPayload}
 */
export function buildRegisterUserPayload(form) {
  return {
    email: form.email.trim(),
    password: form.password,
    passwordConfirm: form.passwordConfirm,
    userName: String(form.userName).trim().toLowerCase(),
    backgroundPresetId: DEFAULT_USER_BACKGROUND_PRESET_ID,
    userGender: USER_GENDER_NO_SELECTED,
    notificationsEnabled: true,
  };
}
