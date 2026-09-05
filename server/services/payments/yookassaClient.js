import { randomUUID } from "node:crypto";

import {
  YOOKASSA_API_BASE_URL_DEFAULT,
  YOOKASSA_PAYMENT_METHOD_SBP,
  YOOKASSA_HTTP_TIMEOUT_MS,
  YOOKASSA_NOT_CONFIGURED_MESSAGE,
  YOOKASSA_UNAVAILABLE_MESSAGE,
} from "../../constants/yookassaConstants.js";
import { AppError } from "../../errors/AppError.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Ключи ЮKassa одни на площадку и живут в окружении.
 *
 * @returns {{ baseUrl: string; shopId: string; secretKey: string } | null}
 */
export function resolveYookassaConfig() {
  const shopId = String(process.env.YOOKASSA_SHOP_ID ?? "").trim();
  const secretKey = String(process.env.YOOKASSA_SECRET_KEY ?? "").trim();
  if (!shopId || !secretKey) {
    return null;
  }
  const baseUrl =
    String(process.env.YOOKASSA_API_BASE_URL ?? "").trim() ||
    YOOKASSA_API_BASE_URL_DEFAULT;
  return { baseUrl: baseUrl.replace(/\/+$/, ""), shopId, secretKey };
}

/** Настроена ли интеграция: без ключей оплату картой не предлагаем. */
export const isYookassaConfigured = () => resolveYookassaConfig() !== null;

/**
 * @param {{ shopId: string; secretKey: string }} config
 */
function buildHeaders(config) {
  const basic = Buffer.from(`${config.shopId}:${config.secretKey}`, "utf8").toString(
    "base64",
  );
  return {
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * @param {Response} response
 */
async function readErrorDescription(response) {
  try {
    const text = await response.text();
    if (!text) return "";
    try {
      const parsed = JSON.parse(text);
      // `parameter` называет поле, которое банку не понравилось. Без него в
      // логе остаётся только «Invalid parameter value» — искать нечего.
      const parts = [parsed?.description, parsed?.code, parsed?.parameter]
        .map((part) => String(part ?? "").trim())
        .filter(Boolean);
      return (parts.length > 0 ? parts.join(" | ") : text).slice(0, 300);
    } catch {
      return text.slice(0, 300);
    }
  } catch {
    return "";
  }
}

/**
 * @param {{ method: string; path: string; body?: unknown; idempotenceKey?: string }} input
 */
async function callYookassa({ method, path, body, idempotenceKey }) {
  const config = resolveYookassaConfig();
  if (!config) {
    throw new AppError(503, YOOKASSA_NOT_CONFIGURED_MESSAGE);
  }

  const headers = buildHeaders(config);
  // Ключ идемпотентности обязателен только для POST, но лишним не бывает:
  // повтор после таймаута не должен создать второй платёж.
  if (method !== "GET") {
    headers["Idempotence-Key"] = idempotenceKey ?? randomUUID();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), YOOKASSA_HTTP_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "yookassa.request_failed",
      path,
      method,
      message: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(502, YOOKASSA_UNAVAILABLE_MESSAGE);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const description = await readErrorDescription(response);
    logServerEvent("error", {
      event: "yookassa.request_rejected",
      path,
      method,
      statusCode: response.status,
      description,
    });
    // Наружу отдаём общий текст: описание от банка адресовано нам, не покупателю.
    throw new AppError(response.status === 400 ? 400 : 502, YOOKASSA_UNAVAILABLE_MESSAGE);
  }

  try {
    return await response.json();
  } catch {
    throw new AppError(502, YOOKASSA_UNAVAILABLE_MESSAGE);
  }
}

/**
 * Создать платёж.
 *
 * `idempotenceKey` обязателен и должен быть стабильным для одной попытки
 * оплаты: при повторе ЮKassa вернёт тот же платёж, а не создаст второй.
 *
 * @param {{
 *   amountRub: number;
 *   description: string;
 *   returnUrl: string;
 *   idempotenceKey: string;
 *   metadata?: Record<string, string>;
 *   receipt?: Record<string, unknown>;
 * }} input
 */
export async function createYookassaPayment({
  amountRub,
  description,
  returnUrl,
  idempotenceKey,
  metadata,
  receipt,
}) {
  const body = {
    amount: { value: Number(amountRub).toFixed(2), currency: "RUB" },
    // Одностадийный платёж: деньги списываются сразу, без холдирования.
    capture: true,
    // Только СБП. Без этого поля ЮKassa открыла бы витрину со всеми
    // подключёнными способами, и платёж ушёл бы картой.
    payment_method_data: { type: YOOKASSA_PAYMENT_METHOD_SBP },
    confirmation: { type: "redirect", return_url: returnUrl },
    description: String(description).slice(0, 128),
    ...(metadata ? { metadata } : {}),
    ...(receipt ? { receipt } : {}),
  };

  return callYookassa({
    method: "POST",
    path: "/payments",
    body,
    idempotenceKey,
  });
}

/**
 * Перезапросить платёж — источник истины по статусу.
 *
 * @param {string} paymentId
 */
export async function getYookassaPayment(paymentId) {
  const safeId = encodeURIComponent(String(paymentId));
  return callYookassa({ method: "GET", path: `/payments/${safeId}` });
}
