import {
  LOBO_API_BASE_URL_DEFAULT,
  LOBO_HTTP_TIMEOUT_MS,
  LOBO_NOT_CONFIGURED_MESSAGE,
  LOBO_UNAVAILABLE_MESSAGE,
} from "../../../constants/loboConstants.js";
import { AppError } from "../../../errors/AppError.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

/**
 * Ключи ЛОБО одни на платформу и живут в окружении.
 *
 * @returns {{ baseUrl: string; apiKey: string; login: string; password: string } | null}
 */
export function resolveLoboConfig() {
  const apiKey = String(process.env.LOBO_API_KEY ?? "").trim();
  const login = String(process.env.LOBO_API_LOGIN ?? "").trim();
  const password = String(process.env.LOBO_API_PASSWORD ?? "").trim();
  if (!apiKey || !login || !password) {
    return null;
  }
  const baseUrl =
    String(process.env.LOBO_API_BASE_URL ?? "").trim() || LOBO_API_BASE_URL_DEFAULT;
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey, login, password };
}

/** Настроена ли интеграция: без ключей службу не предлагаем вовсе. */
export const isLoboConfigured = () => resolveLoboConfig() !== null;

/**
 * @param {{ apiKey: string; login: string; password: string }} config
 */
function buildHeaders(config) {
  const basic = Buffer.from(config.login + ":" + config.password, "utf8").toString(
    "base64",
  );
  return {
    "X-API-Key": config.apiKey,
    Authorization: "Basic " + basic,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * @param {Response} response
 */
async function readError(response) {
  try {
    const text = await response.text();
    if (!text) return "";
    try {
      const parsed = JSON.parse(text);
      const detail = parsed?.detail ?? parsed?.message ?? parsed?.error;
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
 * Один запрос к DMS.
 *
 * Ошибки службы наружу как есть не выносим: продавцу нужен понятный текст,
 * а подробности уходят в лог.
 *
 * @param {{
 *   method: "GET" | "POST";
 *   path: string;
 *   body?: unknown;
 *   query?: Record<string, unknown>;
 * }} input
 */
export async function loboRequest({ method, path, body, query }) {
  const config = resolveLoboConfig();
  if (!config) {
    throw new AppError(503, LOBO_NOT_CONFIGURED_MESSAGE);
  }

  const url = new URL(config.baseUrl + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOBO_HTTP_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers: buildHeaders(config),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "lobo_request_failed",
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(502, LOBO_UNAVAILABLE_MESSAGE);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const detail = await readError(response);
    logServerEvent("error", {
      event: "lobo_request_rejected",
      path,
      status: response.status,
      detail,
    });
    // 429 — это наш перебор с частотой, а не вина того, кто нажал кнопку.
    if (response.status === 429) {
      throw new AppError(503, LOBO_UNAVAILABLE_MESSAGE);
    }
    if (response.status === 401 || response.status === 403) {
      throw new AppError(503, LOBO_NOT_CONFIGURED_MESSAGE);
    }
    throw new AppError(502, detail || LOBO_UNAVAILABLE_MESSAGE);
  }

  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** @param {any} data */
export function normalizeLoboOrder(data) {
  if (!data || typeof data !== "object") return null;
  return {
    id: data.id ?? null,
    externalId: data.external_id ?? "",
    status: String(data.status ?? ""),
    cost: Number(data.cost) || 0,
    finalCost: Number(data.final_cost) || 0,
    courierName: data.courier_name ?? "",
    courierPhone: data.courier_phone ?? "",
    distanceKm: Number(data.distance_km) || 0,
    durationMin: Number(data.duration_min) || 0,
    createdAt: data.created_at ?? null,
    assignedAt: data.assigned_at ?? null,
    deliveredAt: data.delivered_at ?? null,
  };
}

/**
 * Расчёт стоимости без создания заказа.
 *
 * @param {{
 *   pickupLat: number;
 *   pickupLon: number;
 *   deliveryLat: number;
 *   deliveryLon: number;
 *   tariffId?: number | null;
 *   zoneId?: number | null;
 * }} input
 */
export async function estimateLoboDelivery({
  pickupLat,
  pickupLon,
  deliveryLat,
  deliveryLon,
  tariffId = null,
  zoneId = null,
}) {
  const data = await loboRequest({
    method: "POST",
    path: "/estimate",
    body: {
      pickup_lat: pickupLat,
      pickup_lon: pickupLon,
      delivery_lat: deliveryLat,
      delivery_lon: deliveryLon,
      ...(tariffId == null ? {} : { tariff_id: tariffId }),
      ...(zoneId == null ? {} : { zone_id: zoneId }),
    },
  });

  return {
    cost: Number(data?.cost) || 0,
    subzoneFee: Number(data?.subzone_fee) || 0,
    finalCost: Number(data?.final_cost) || 0,
    zoneId: data?.zone?.id ?? null,
    zoneName: data?.zone?.name ?? "",
    isSuburban: data?.is_suburban === true,
    distanceKm: Number(data?.distance_km) || 0,
    durationMin: Number(data?.duration_min) || 0,
  };
}

/**
 * Создание заказа на доставку.
 *
 * @param {{
 *   externalId: string;
 *   clientName: string;
 *   clientPhone: string;
 *   pickupAddress: string;
 *   pickupLat: number;
 *   pickupLon: number;
 *   deliveryAddress: string;
 *   deliveryLat: number;
 *   deliveryLon: number;
 *   recipientName?: string;
 *   recipientPhone?: string;
 *   cost?: number | null;
 *   paymentMethod?: string | null;
 *   note?: string;
 * }} input
 */
export async function createLoboOrder(input) {
  const data = await loboRequest({
    method: "POST",
    path: "/orders",
    body: {
      external_id: input.externalId,
      client_name: input.clientName,
      client_phone: input.clientPhone,
      pickup_address: input.pickupAddress,
      pickup_lat: input.pickupLat,
      pickup_lon: input.pickupLon,
      delivery_address: input.deliveryAddress,
      delivery_lat: input.deliveryLat,
      delivery_lon: input.deliveryLon,
      ...(input.recipientName ? { recipient_name: input.recipientName } : {}),
      ...(input.recipientPhone ? { recipient_phone: input.recipientPhone } : {}),
      // Платит покупатель при получении: службе нужна сумма и признак, что
      // заказ ещё не оплачен.
      ...(input.cost == null ? {} : { cost: input.cost }),
      ...(input.paymentMethod ? { payment_method: input.paymentMethod } : {}),
      is_paid: false,
      ...(input.note ? { note: input.note } : {}),
    },
  });

  return normalizeLoboOrder(data);
}

/** @param {string} externalId */
export async function getLoboOrderByExternalId(externalId) {
  const data = await loboRequest({
    method: "GET",
    path: "/orders/by-number/" + encodeURIComponent(externalId),
  });
  return normalizeLoboOrder(data);
}

/**
 * Отмена по нашему номеру. Повторная отмена у службы идемпотентна.
 *
 * @param {string} externalId
 */
export async function cancelLoboOrderByExternalId(externalId) {
  const data = await loboRequest({
    method: "POST",
    path: "/orders/by-number/" + encodeURIComponent(externalId) + "/cancel",
  });
  return normalizeLoboOrder(data);
}
