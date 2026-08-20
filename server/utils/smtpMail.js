import nodemailer from "nodemailer";

import { SMTP_DEFAULT_PORT } from "../constants/smtpConstants.js";
import { resolveSmtpSecure } from "./resolveSmtpSecure.js";

/**
 * @returns {boolean}
 */
export const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createSmtpTransport = () => {
  const port = Number(process.env.SMTP_PORT) || SMTP_DEFAULT_PORT;
  const secure = resolveSmtpSecure(port);
  const rejectUnauthorized =
    String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED ?? "true").toLowerCase() !==
    "false";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Для портов без неявного TLS (587, 1126, 2525, …) требуем STARTTLS — иначе
    // nodemailer может уйти в открытый текст, если сервер не форсит апгрейд.
    ...(secure ? {} : { requireTLS: true }),
    tls: { rejectUnauthorized },
  });
};

/**
 * @param {{ to: string; subject: string; text: string; html?: string }} params
 */
export const sendSmtpMail = async ({ to, subject, text, html }) => {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER;
  const transport = createSmtpTransport();

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html: html ?? text,
  });
};
