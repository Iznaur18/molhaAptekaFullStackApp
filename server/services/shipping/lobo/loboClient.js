import {
  LOBO_API_BASE_URL_DEFAULT,
  LOBO_DEFAULT_TARIFF,
  LOBO_HTTP_TIMEOUT_MS,
  LOBO_NOT_CONFIGURED_MESSAGE,
  LOBO_PAYMENT_METHOD,
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

/** @param {unknown} value */
const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

/**
 * Заказ Wayset в нашем виде.
 *
 * Форму ответа на заказ документация не описывает, поэтому читаем терпимо:
 * цена бывает `total` (как в расчёте) или `cost`/`final_cost`, курьер —
 * плоскими полями или вложенным объектом.
 *
 * @param {any} data
 */
export function normalizeLoboOrder(data) {
  const row = data?.order && typeof data.order === "object" ? data.order : data;
  if (!row || typeof row !== "object") return null;
  const courier = row.courier && typeof row.courier === "object" ? row.courier : {};
  return {
    id: row.id == null ? null : String(row.id),
    externalId: String(row.external_id ?? ""),
    status: String(row.status ?? ""),
    // Wayset склеил заказ с другим в один рейс: дальше статус живёт там.
    mergedInto: row.merged_into == null ? null : String(row.merged_into),
    total: toNumber(row.total ?? row.final_cost ?? row.cost),
    courierName: String(row.courier_name ?? courier.name ?? ""),
    courierPhone: String(row.courier_phone ?? courier.phone ?? ""),
    courierCarBrand: String(row.courier_car_brand ?? ""),
    courierCarColor: String(row.courier_car_color ?? ""),
    courierCarNumber: String(row.courier_car_number ?? ""),
    distanceKm: toNumber(row.distance_km),
    durationMin: toNumber(row.duration_min),
    createdAt: row.created_at ?? null,
    deliveredAt: row.delivered_at ?? null,
  };
}

/**
 * Расчёт стоимости без создания заказа.
 *
 * `quoteToken` закрепляет цену: передаём его при создании заказа, и курьер
 * возьмёт ровно названную сумму. Живёт `quoteValidForSeconds` (сейчас 300).
 *
 * @param {{
 *   pickupLat: number;
 *   pickupLon: number;
 *   deliveryLat: number;
 *   deliveryLon: number;
 *   tariff?: string;
 * }} input
 */
export async function estimateLoboDelivery({
  pickupLat,
  pickupLon,
  deliveryLat,
  deliveryLon,
  tariff = LOBO_DEFAULT_TARIFF,
}) {
  const data = await loboRequest({
    method: "POST",
    path: "/estimate",
    body: {
      pickup_lat: pickupLat,
      pickup_lon: pickupLon,
      delivery_lat: deliveryLat,
      delivery_lon: deliveryLon,
      tariff,
    },
  });

  return {
    finalCost: toNumber(data?.total),
    subzoneFee: toNumber(data?.subzone_fee),
    tariff: String(data?.tariff ?? tariff),
    cityId: data?.city_id ?? null,
    cityName: String(data?.city_name ?? ""),
    isSuburban: data?.is_suburban === true,
    distanceKm: toNumber(data?.distance_km),
    durationMin: toNumber(data?.duration_min),
    quoteToken: String(data?.quote_token ?? ""),
    quoteValidForSeconds: toNumber(data?.quote_valid_for_seconds),
  };
}

/**
 * Создание заказа на доставку. Идемпотентно по `external_id`: повтор с тем же
 * номером вернёт уже созданный заказ.
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
 *   tariff?: string;
 *   quoteToken?: string;
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
      tariff: input.tariff || LOBO_DEFAULT_TARIFF,
      // Платит покупатель курьеру при получении.
      payment_method: LOBO_PAYMENT_METHOD,
      is_paid: false,
      ...(input.quoteToken ? { quote_token: input.quoteToken } : {}),
      ...(input.note ? { note: input.note } : {}),
    },
  });

  return normalizeLoboOrder(data);
}

/** @param {string} id — id заказа в Wayset */
export async function getLoboOrder(id) {
  const data = await loboRequest({
    method: "GET",
    path: "/orders/" + encodeURIComponent(id),
  });
  return normalizeLoboOrder(data);
}

/**
 * Заказ по нашему номеру — для отправлений, у которых id Wayset не
 * сохранился (служба создала заказ, а мы не успели записать ответ).
 *
 * @param {string} externalId
 */
export async function findLoboOrderByExternalId(externalId) {
  const data = await loboRequest({ method: "GET", path: "/orders" });
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.orders)
      ? data.orders
      : [];
  const match = rows.find((row) => String(row?.external_id ?? "") === externalId);
  return match ? normalizeLoboOrder(match) : null;
}

/**
 * Отмена до забора груза. Повторная отмена у службы идемпотентна.
 *
 * @param {string} id — id заказа в Wayset
 */
export async function cancelLoboOrder(id) {
  const data = await loboRequest({
    method: "POST",
    path: "/orders/" + encodeURIComponent(id) + "/cancel",
  });
  return normalizeLoboOrder(data);
}

/**
 * Код и ссылка отслеживания для покупателя.
 *
 * @param {string} id — id заказа в Wayset
 */
export async function getLoboTracking(id) {
  const data = await loboRequest({
    method: "POST",
    path: "/orders/" + encodeURIComponent(id) + "/track",
  });
  return {
    code: String(data?.code ?? data?.track_code ?? ""),
    url: String(data?.url ?? data?.link ?? data?.track_url ?? ""),
  };
}
