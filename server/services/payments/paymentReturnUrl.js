import { AppError } from "../../errors/AppError.js";

/**
 * Абсолютный адрес возврата для ЮKassa.
 *
 * Origin берём из `FRONTEND_URL`, а не из тела запроса: клиент передаёт только
 * путь внутри сайта, иначе кнопка оплаты стала бы открытым редиректом.
 *
 * @param {string} relativePath
 */
export function buildReturnUrl(relativePath) {
  const origin = String(process.env.FRONTEND_URL ?? "")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");
  if (!origin) {
    throw new AppError(
      500,
      "Не настроен FRONTEND_URL — некуда возвращать после оплаты",
    );
  }
  const path = String(relativePath ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new AppError(400, "Адрес возврата должен быть путём внутри сайта");
  }
  return `${origin}${path}`;
}

/**
 * Добавляет paymentId в return path, чтобы после редиректа с ЮKassa sync
 * работал без sessionStorage (другая вкладка / потеря storage).
 *
 * @param {string} relativePath
 * @param {string} paymentId
 * @returns {string}
 */
export function appendPaymentIdToReturnPath(relativePath, paymentId) {
  const path = String(relativePath ?? "").trim();
  const id = String(paymentId ?? "").trim();
  if (!id) {
    return path;
  }
  const url = new URL(path, "https://return.local");
  url.searchParams.set("paymentId", id);
  return `${url.pathname}${url.search}${url.hash}`;
}
