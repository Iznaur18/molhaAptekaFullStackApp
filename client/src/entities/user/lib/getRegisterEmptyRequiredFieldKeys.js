/** Ключи полей формы регистрации с HTML `required`. */
export const REGISTER_REQUIRED_FIELD_KEYS = [
  "email",
  "password",
  "passwordConfirm",
  "userName",
];

/**
 * @param {{
 *   email: string;
 *   password: string;
 *   passwordConfirm: string;
 *   userName: string;
 * }} form
 * @returns {typeof REGISTER_REQUIRED_FIELD_KEYS[number][]}
 */
export function getRegisterEmptyRequiredFieldKeys(form) {
  const empty = [];

  if (!String(form.email ?? "").trim()) {
    empty.push("email");
  }
  if (!String(form.password ?? "").length) {
    empty.push("password");
  }
  if (!String(form.passwordConfirm ?? "").length) {
    empty.push("passwordConfirm");
  }
  if (!String(form.userName ?? "").trim()) {
    empty.push("userName");
  }

  return empty;
}
