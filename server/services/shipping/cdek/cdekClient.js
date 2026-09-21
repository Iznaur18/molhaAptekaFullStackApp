import {
  CDEK_HTTP_TIMEOUT_MS,
  CDEK_INVALID_CREDENTIALS_MESSAGE,
  CDEK_TOKEN_TTL_MS,
  CDEK_UNAVAILABLE_MESSAGE,
  resolveCdekBaseUrl,
} from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

/**
 * Клиент API СДЭК v2 (apidoc.cdek.ru).
 *
 * Ключи здесь всегда чужие — продавца, а не платформы, поэтому кэш токенов
 * разложен по паре «контур + account»: один продавец не должен ходить под
 * токеном другого.
 *
 * @typedef {{ account: string; secure: string; environment?: string }} CdekCredentials
 */

/** @type {Map<string, { token: string; expiresAt: number }>} */
const tokenCache = new Map();

/**
 * @param {CdekCredentials} credentials
 */
function cacheKey(credentials) {
  return `${credentials.environment ?? "prod"}:${credentials.account}`;
}

/** Сбросить кэш токена: после смены ключей продавцом. */
export function forgetCdekToken(credentials) {
  tokenCache.delete(cacheKey(credentials));
}

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
      // Методы заказов кладут ошибки в requests[].errors, остальные — в errors.
      const requestErrors = Array.isArray(parsed?.requests)
        ? parsed.requests.flatMap((row) =>
            Array.isArray(row?.errors) ? row.errors : [],
          )
        : [];
      const errors = Array.isArray(parsed?.errors)
        ? parsed.errors
        : requestErrors.length
          ? requestErrors
          : null;
      const detail =
        errors?.[0]?.message ?? parsed?.message ?? parsed?.error_description ?? null;
      if (typeof detail === "string") return detail.slice(0, 300);
      return text.slice(0, 300);
    } catch {
      return text.slice(0, 300);
    }
  } catch {
    return "";
  }
}

/**
 * OAuth-токен СДЭК (grant_type=client_credentials). Живёт час, поэтому кэшируем.
 *
 * @param {CdekCredentials} credentials
 * @returns {Promise<string>}
 */
export async function getCdekToken(credentials) {
  const key = cacheKey(credentials);
  const cached = tokenCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const baseUrl = resolveCdekBaseUrl(credentials.environment);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: credentials.account,
    client_secret: credentials.secure,
  });

  let response;
  try {
    response = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(CDEK_HTTP_TIMEOUT_MS),
    });
  } catch (error) {
    logServerEvent("cdek.token_network_error", {
      environment: credentials.environment ?? "prod",
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(502, CDEK_UNAVAILABLE_MESSAGE);
  }

  if (response.status === 401 || response.status === 400) {
    // Именно этим СДЭК отвечает на чужой или отозванный ключ.
    throw new AppError(400, CDEK_INVALID_CREDENTIALS_MESSAGE);
  }

  if (!response.ok) {
    const detail = await readErrorText(response);
    logServerEvent("cdek.token_failed", { status: response.status, detail });
    throw new AppError(502, CDEK_UNAVAILABLE_MESSAGE);
  }

  const payload = await response.json().catch(() => null);
  const token = String(payload?.access_token ?? "").trim();
  if (!token) {
    logServerEvent("cdek.token_empty", { status: response.status });
    throw new AppError(502, CDEK_UNAVAILABLE_MESSAGE);
  }

  // expires_in приходит в секундах; берём меньшее из него и нашего запаса.
  const expiresInMs = Number(payload?.expires_in) * 1000;
  const ttl = Number.isFinite(expiresInMs) && expiresInMs > 0 ? expiresInMs : 0;
  tokenCache.set(key, {
    token,
    expiresAt: Date.now() + Math.min(ttl || CDEK_TOKEN_TTL_MS, CDEK_TOKEN_TTL_MS),
  });
  return token;
}

/**
 * Запрос к API СДЭК под ключами продавца.
 *
 * @param {CdekCredentials} credentials
 * @param {{ method?: string; path: string; query?: Record<string, unknown>; body?: unknown }} request
 * @returns {Promise<unknown>}
 */
export async function cdekRequest(credentials, { method = "GET", path, query, body }) {
  const token = await getCdekToken(credentials);
  const baseUrl = resolveCdekBaseUrl(credentials.environment);
  const url = new URL(`${baseUrl}${path}`);
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value == null || value === "") continue;
    url.searchParams.set(name, String(value));
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(CDEK_HTTP_TIMEOUT_MS),
    });
  } catch (error) {
    logServerEvent("cdek.request_network_error", {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(502, CDEK_UNAVAILABLE_MESSAGE);
  }

  if (response.status === 401) {
    // Токен протух раньше срока — выкидываем его, следующий вызов возьмёт новый.
    forgetCdekToken(credentials);
    throw new AppError(502, CDEK_UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    const detail = await readErrorText(response);
    logServerEvent("cdek.request_failed", { path, status: response.status, detail });
    throw new AppError(502, detail || CDEK_UNAVAILABLE_MESSAGE);
  }

  return response.json().catch(() => null);
}

/**
 * Скачать файл СДЭК (PDF этикетки) по абсолютной ссылке из ответа API.
 * Ссылка отдаётся только под тем же токеном, поэтому качаем здесь.
 *
 * @param {CdekCredentials} credentials
 * @param {string} fileUrl
 * @returns {Promise<Buffer>}
 */
export async function cdekDownload(credentials, fileUrl) {
  const baseUrl = resolveCdekBaseUrl(credentials.environment);
  // Токен не отдаём на чужой хост, даже если СДЭК пришлёт такую ссылку.
  if (new URL(fileUrl).host !== new URL(baseUrl).host) {
    throw new AppError(502, CDEK_UNAVAILABLE_MESSAGE);
  }
  const token = await getCdekToken(credentials);
  let response;
  try {
    response = await fetch(fileUrl, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(CDEK_HTTP_TIMEOUT_MS),
    });
  } catch (error) {
    logServerEvent("cdek.download_network_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(502, CDEK_UNAVAILABLE_MESSAGE);
  }
  if (!response.ok) {
    const detail = await readErrorText(response);
    logServerEvent("cdek.download_failed", { status: response.status, detail });
    throw new AppError(502, detail || CDEK_UNAVAILABLE_MESSAGE);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Проверка ключей: если токен выдали — ключи рабочие.
 *
 * @param {CdekCredentials} credentials
 * @returns {Promise<void>}
 */
export async function verifyCdekCredentials(credentials) {
  forgetCdekToken(credentials);
  await getCdekToken(credentials);
}
