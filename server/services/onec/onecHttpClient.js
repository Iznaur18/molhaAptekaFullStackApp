import {
  ONEC_ARTICLE_MAX_LENGTH,
  ONEC_DESCRIPTION_MAX_LENGTH,
  ONEC_GUID_MAX_LENGTH,
  ONEC_HTTP_TIMEOUT_MS,
  ONEC_NAME_MAX_LENGTH,
  ONEC_PATH_CUSTOMER_ORDERS,
  ONEC_PATH_HEALTH,
  ONEC_PATH_NOMENCLATURE,
  ONEC_STOCK_MAX,
} from "../../constants/onecConstants.js";
import { AppError } from "../../errors/AppError.js";

/**
 * @param {string} baseUrl
 */
export function normalizeOneCBaseUrl(baseUrl) {
  const trimmed = String(baseUrl ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    throw new AppError(400, "Укажите URL HTTP-сервиса 1С");
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new AppError(400, "Некорректный URL HTTP-сервиса 1С");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError(400, "URL 1С должен начинаться с http:// или https://");
  }
  return trimmed;
}

/**
 * @param {string} baseUrl
 * @param {string} path
 */
function joinUrl(baseUrl, path) {
  return `${normalizeOneCBaseUrl(baseUrl)}${path}`;
}

/**
 * @param {Response} response
 * @param {string} fallback
 */
async function readErrorMessage(response, fallback) {
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const json = JSON.parse(text);
      if (typeof json?.message === "string" && json.message.trim()) {
        return json.message.trim().slice(0, 500);
      }
      if (typeof json?.error === "string" && json.error.trim()) {
        return json.error.trim().slice(0, 500);
      }
    } catch {
      // plain text
    }
    return text.slice(0, 500);
  } catch {
    return fallback;
  }
}

/**
 * @param {{
 *   baseUrl: string;
 *   apiKey: string;
 *   path: string;
 *   method?: string;
 *   body?: unknown;
 *   timeoutMs?: number;
 * }} params
 */
async function oneCFetch({
  baseUrl,
  apiKey,
  path,
  method = "GET",
  body,
  timeoutMs = ONEC_HTTP_TIMEOUT_MS,
}) {
  const url = joinUrl(baseUrl, path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(body != null ? { "Content-Type": "application/json" } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await readErrorMessage(
        response,
        `1С ответила ${response.status}`,
      );
      throw new AppError(
        response.status >= 500 ? 502 : 400,
        message,
      );
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!text.trim()) return null;
      try {
        return JSON.parse(text);
      } catch {
        throw new AppError(502, "1С вернула не-JSON ответ");
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error?.name === "AbortError") {
      throw new AppError(504, "Таймаут ответа 1С");
    }
    const message =
      error instanceof Error ? error.message : "Ошибка соединения с 1С";
    throw new AppError(502, message);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {{ baseUrl: string; apiKey: string }} creds
 */
export async function testOneCConnection(creds) {
  const data = await oneCFetch({
    ...creds,
    path: ONEC_PATH_HEALTH,
    method: "GET",
  });
  return data ?? { ok: true };
}

/**
 * @param {unknown} raw
 */
export function normalizeNomenclatureItems(raw) {
  const list = Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw)
      ? raw
      : null;

  if (!list) {
    throw new AppError(502, "1С: ожидался JSON { items: [...] }");
  }

  /** @type {Array<{
   *   guid: string;
   *   article: string;
   *   name: string;
   *   price: number;
   *   stock: number;
   *   isActive: boolean;
   *   description: string;
   *   imageUrls: string[];
   * }>} */
  const items = [];

  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const guid = String(row.guid ?? row.GUID ?? "").trim();
    if (!guid || guid.length > ONEC_GUID_MAX_LENGTH) continue;

    const name = String(row.name ?? row.Name ?? "").trim().slice(0, ONEC_NAME_MAX_LENGTH);
    if (!name) continue;

    const price = Number(row.price ?? row.Price);
    if (!Number.isFinite(price) || price < 0) continue;

    let stock = Number(row.stock ?? row.Stock ?? 0);
    if (!Number.isFinite(stock) || stock < 0) stock = 0;
    stock = Math.min(ONEC_STOCK_MAX, Math.floor(stock));

    const article = String(row.article ?? row.Article ?? "")
      .trim()
      .slice(0, ONEC_ARTICLE_MAX_LENGTH);

    const description = String(row.description ?? row.Description ?? "")
      .trim()
      .slice(0, ONEC_DESCRIPTION_MAX_LENGTH);

    const isActive =
      row.isActive === false || row.IsActive === false || row.active === false
        ? false
        : true;

    const imageRaw = row.imageUrls ?? row.ImageUrls ?? row.images ?? [];
    const imageUrls = Array.isArray(imageRaw)
      ? imageRaw
          .map((u) => String(u ?? "").trim())
          .filter(Boolean)
          .slice(0, 10)
      : [];

    items.push({
      guid,
      article,
      name,
      price,
      stock,
      isActive,
      description,
      imageUrls,
    });
  }

  return items;
}

/**
 * @param {{ baseUrl: string; apiKey: string }} creds
 */
export async function fetchOneCNomenclature(creds) {
  const data = await oneCFetch({
    ...creds,
    path: ONEC_PATH_NOMENCLATURE,
    method: "GET",
  });
  return normalizeNomenclatureItems(data);
}

/**
 * @param {{
 *   baseUrl: string;
 *   apiKey: string;
 *   payload: Record<string, unknown>;
 * }} params
 */
export async function postOneCCustomerOrder({ baseUrl, apiKey, payload }) {
  const data = await oneCFetch({
    baseUrl,
    apiKey,
    path: ONEC_PATH_CUSTOMER_ORDERS,
    method: "POST",
    body: payload,
  });

  const externalId = String(
    data?.externalId ?? data?.ExternalId ?? data?.id ?? "",
  ).trim();

  return {
    externalId: externalId || null,
    raw: data,
  };
}
