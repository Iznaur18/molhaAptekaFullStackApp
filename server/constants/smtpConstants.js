export const SMTP_DEFAULT_PORT = 587;

/** Порты с implicit TLS (nodemailer `secure: true`). */
export const SMTP_IMPLICIT_TLS_PORTS = new Set([465, 1127]);

export const EMAIL_VERIFICATION_SUBJECT = "Подтверждение email — Gitorg";
