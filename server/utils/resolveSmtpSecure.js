import { SMTP_IMPLICIT_TLS_PORTS } from "../constants/smtpConstants.js";

/**
 * Nodemailer `secure`: implicit TLS on connect (465 / Selectel 1127).
 * Override: SMTP_SECURE=true|false|1|0
 *
 * @param {number} port
 * @param {string | undefined} [secureEnv]
 * @returns {boolean}
 */
export function resolveSmtpSecure(port, secureEnv = process.env.SMTP_SECURE) {
  const raw = String(secureEnv ?? "")
    .trim()
    .toLowerCase();
  if (raw === "true" || raw === "1") {
    return true;
  }
  if (raw === "false" || raw === "0") {
    return false;
  }
  return SMTP_IMPLICIT_TLS_PORTS.has(Number(port));
}
