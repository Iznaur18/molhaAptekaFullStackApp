import {
  YANDEX_DELIVERY_HTTP_TIMEOUT_MS,
  YANDEX_DELIVERY_INVALID_TOKEN_MESSAGE,
  YANDEX_DELIVERY_UNAVAILABLE_MESSAGE,
  resolveYandexDeliveryBaseUrl,
  resolveYandexExpressBaseUrl,
} from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

/**
 * Клиент API Яндекс Доставки «в другой день» (b2b platform).
 *
 * Токен всегда продавца, не площадки: OAuth-токен из профиля компании в
 * кабинете dostavka.yandex.ru, передаётся как Bearer.
 *
 * @typedef {{ token: string; environment?: string }} YandexDeliveryCredentials
 */

/** Кабинету не разрешён «Экспресс»: токен верный, но тариф не подключён. */
export const YANDEX_EXPRESS_FORBIDDEN_MESSAGE =
  "Яндекс не разрешает вашему кабинету «Экспресс» — подключите его в кабинете Яндекс Доставки или у менеджера";

/**
 * @param {YandexDeliveryCredentials} credentials
 * @param {"platform" | "express"} api
 */
const resolveBaseUrl = (credentials, api) =>
  api === "express"
    ? resolveYandexExpressBaseUrl(credentials.environment)
    : resolveYandexDeliveryBaseUrl(credentials.environment);

/**
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function readErrorText(response) {
  try {
    const text = await response.text();
    if (!text) return "";
    try {
      const parsed = JSON.parse(text);
      const detail = parsed?.message ?? parsed?.error?.message ?? parsed?.code ?? null;
      return typeof detail === "string" ? detail.slice(0, 300) : text.slice(0, 300);
    } catch {
      return text.slice(0, 300);
    }
  } catch {
    return "";
  }
}

/**
 * @param {YandexDeliveryCredentials} credentials
 * @param {{
 *   method?: string;
 *   path: string;
 *   query?: Record<string, unknown>;
 *   body?: unknown;
 *   api?: "platform" | "express";
 * }} request
 *   api: platform — «в другой день», express — «Экспресс» (cargo claims).
 * @returns {Promise<unknown>}
 */
export async function yandexDeliveryRequest(
  credentials,
  { method = "POST", path, query, body, api = "platform" },
) {
  const url = new URL(`${resolveBaseUrl(credentials, api)}${path}`);
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value == null || value === "") continue;
    url.searchParams.set(name, String(value));
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        Accept: "application/json",
        "Accept-Language": "ru",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(YANDEX_DELIVERY_HTTP_TIMEOUT_MS),
    });
  } catch (error) {
    logServerEvent("yandex_delivery.request_network_error", {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(502, YANDEX_DELIVERY_UNAVAILABLE_MESSAGE);
  }

  // «Экспресс» отвечает 403 и на верный токен, если тариф кабинету не открыт.
  if (api === "express" && response.status === 403) {
    throw new AppError(409, YANDEX_EXPRESS_FORBIDDEN_MESSAGE);
  }
  // Чужой, отозванный или истёкший токен: так Яндекс отвечает на любой из них.
  if (response.status === 401 || response.status === 403) {
    throw new AppError(400, YANDEX_DELIVERY_INVALID_TOKEN_MESSAGE);
  }

  if (!response.ok) {
    const detail = await readErrorText(response);
    logServerEvent("yandex_delivery.request_failed", {
      api,
      path,
      status: response.status,
      detail,
    });
    throw new AppError(502, detail || YANDEX_DELIVERY_UNAVAILABLE_MESSAGE);
  }

  return response.json().catch(() => null);
}

/**
 * Запрос, который отвечает файлом (ярлык PDF), а не JSON.
 *
 * @param {YandexDeliveryCredentials} credentials
 * @param {{ path: string; body: unknown }} request
 * @returns {Promise<Buffer>}
 */
export async function yandexDeliveryRequestFile(credentials, { path, body }) {
  const url = `${resolveYandexDeliveryBaseUrl(credentials.environment)}${path}`;
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        "Content-Type": "application/json",
        "Accept-Language": "ru",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(YANDEX_DELIVERY_HTTP_TIMEOUT_MS),
    });
  } catch (error) {
    logServerEvent("yandex_delivery.file_network_error", {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(502, YANDEX_DELIVERY_UNAVAILABLE_MESSAGE);
  }
  if (response.status === 401 || response.status === 403) {
    throw new AppError(400, YANDEX_DELIVERY_INVALID_TOKEN_MESSAGE);
  }
  if (!response.ok) {
    const detail = await readErrorText(response);
    logServerEvent("yandex_delivery.file_failed", {
      path,
      status: response.status,
      detail,
    });
    throw new AppError(502, detail || YANDEX_DELIVERY_UNAVAILABLE_MESSAGE);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Проверка токена: самый лёгкий метод, который требует авторизации.
 *
 * @param {YandexDeliveryCredentials} credentials
 */
export async function verifyYandexDeliveryToken(credentials) {
  await yandexDeliveryRequest(credentials, {
    path: "/location/detect",
    body: { location: "Москва" },
  });
}
