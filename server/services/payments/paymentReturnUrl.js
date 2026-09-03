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
    throw new AppError(500, "Не настроен FRONTEND_URL — некуда возвращать после оплаты");
  }
  const path = String(relativePath ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new AppError(400, "Адрес возврата должен быть путём внутри сайта");
  }
  return `${origin}${path}`;
}
