/** @typedef {"email" | "phone"} AuthChannel */

/**
 * @param {{
 *   channel: AuthChannel;
 *   email?: string;
 *   phoneNumber?: string;
 *   password: string;
 *   passwordConfirm: string;
 *   userName: string;
 * }} form
 * @returns {string[]}
 */
export function getRegisterEmptyRequiredFieldKeys(form) {
  const empty = [];
  const channel = form.channel === "phone" ? "phone" : "email";

  if (channel === "email") {
    if (!String(form.email ?? "").trim()) empty.push("email");
  } else if (!String(form.phoneNumber ?? "").trim()) {
    empty.push("phoneNumber");
  }

  if (!String(form.password ?? "").length) empty.push("password");
  if (!String(form.passwordConfirm ?? "").length) empty.push("passwordConfirm");
  if (!String(form.userName ?? "").trim()) empty.push("userName");

  return empty;
}
