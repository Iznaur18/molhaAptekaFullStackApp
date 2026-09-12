import { normalizeGeoCoord, sellerDeliveryDistanceKm } from "@molha/api-contract";

import {
  CLIENT_GEO_TOLERANCE_KM,
  GEO_PRECISION_HOUSE,
  GEO_PRECISION_STREET,
} from "../../constants/geoRoutingConstants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { geocodeCoarseWithDadata } from "../../utils/dadata/dadataGeocode.js";
import { verifyRuDeliveryAddress } from "../../utils/dadata/verifyRuDeliveryAddress.js";
import {
  geocodeAddressWithOsm,
  geocodeCoarseWithOsm,
  geoPrecisionRank,
} from "../shipping/geo/osmGeocoder.js";

/**
 * Откуда и куда едет доставка продавца — две точки для маршрута по дорогам.
 *
 * Правило одно: расстояние обязано посчитаться. Поэтому точка ищется
 * цепочкой источников, от точного к грубому, и отказ возможен только когда
 * адрес не находится на карте вообще ни одним способом.
 */

export const DELIVERY_ADDRESS_NOT_FOUND_MESSAGE =
  "Не удалось найти адрес доставки на карте — выберите адрес из подсказок";

export const DELIVERY_ORIGIN_NOT_FOUND_MESSAGE =
  "Не удалось найти на карте адрес, откуда продавец везёт заказ — напишите продавцу";

/**
 * @param {{ lat?: unknown; lon?: unknown } | null | undefined} raw
 * @returns {{ lat: number; lon: number } | null}
 */
function toPoint(raw) {
  const lat = normalizeGeoCoord(raw?.lat);
  const lon = normalizeGeoCoord(raw?.lon);
  if (lat === null || lon === null || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }
  return { lat, lon };
}

/**
 * Лучшая точка для строки адреса.
 *
 * 1. Координаты DaData, если адрес уже проверен.
 * 2. OpenStreetMap (Nominatim, Photon) — когда DaData не дала дома.
 * 3. Грубо: улица или город — через DaData, потом через OSM.
 *
 * @param {{
 *   line: string;
 *   verified?: {
 *     geo?: { lat: number; lon: number } | null;
 *     geoPrecision?: string | null;
 *     fiasId?: string;
 *     city?: string;
 *     street?: string;
 *     house?: string;
 *   } | null;
 * }} input
 */
export async function geocodeAddressBest({ line, verified = null }) {
  const text = String(line ?? "").trim();
  /** @type {{ point: { lat: number; lon: number }; precision: string; provider: string } | null} */
  let best = null;
  /** @param {typeof best} candidate */
  const consider = (candidate) => {
    if (
      candidate &&
      geoPrecisionRank(candidate.precision) > geoPrecisionRank(best?.precision)
    ) {
      best = candidate;
    }
  };

  const verifiedPoint = toPoint(verified?.geo);
  if (verifiedPoint) {
    consider({
      point: verifiedPoint,
      // Подсказка без дома в ФИАС отдаёт координаты улицы — считаем так же.
      precision:
        verified?.geoPrecision ||
        (verified?.fiasId ? GEO_PRECISION_HOUSE : GEO_PRECISION_STREET),
      provider: "dadata",
    });
  }
  if (!text) {
    return best;
  }
  if (best?.precision !== GEO_PRECISION_HOUSE) {
    consider(
      await geocodeAddressWithOsm({
        line: text,
        city: verified?.city,
        street: verified?.street,
        house: verified?.house,
      }),
    );
  }
  if (!best) {
    consider(await geocodeCoarseWithDadata(text));
  }
  if (!best) {
    consider(await geocodeCoarseWithOsm(text));
  }
  return best;
}

/**
 * Куда везти.
 *
 * Клиентская точка (метка на карте, сохранённый адрес) точнее найденной по
 * тексту: это подъезд, а не середина улицы. Но прислать её может кто угодно,
 * поэтому берём её, только если она лежит в пределах погрешности найденной
 * (`CLIENT_GEO_TOLERANCE_KM`). Одна лишь клиентская точка — последний
 * вариант, когда текст адреса не нашёлся на карте ни одним способом.
 *
 * @param {{
 *   verifiedAddress: Parameters<typeof geocodeAddressBest>[0]["verified"] & { displayAddress?: string };
 *   clientGeo?: { lat?: unknown; lon?: unknown } | null;
 * }} input
 * @returns {Promise<{ point: { lat: number; lon: number }; precision: string; provider: string }>}
 */
export async function resolveDeliveryDestination({
  verifiedAddress,
  clientGeo = null,
}) {
  const best = await geocodeAddressBest({
    line: String(verifiedAddress?.displayAddress ?? ""),
    verified: verifiedAddress,
  });
  const client = toPoint(clientGeo);

  if (best && client) {
    const toleranceKm = CLIENT_GEO_TOLERANCE_KM[best.precision] ?? 0;
    const gapKm = sellerDeliveryDistanceKm(client, best.point);
    if (toleranceKm > 0 && gapKm !== null && gapKm <= toleranceKm) {
      return { point: client, precision: best.precision, provider: "client" };
    }
  }
  if (best) {
    return best;
  }
  if (client) {
    logServerEvent("warn", {
      event: "geo.destination_client_only",
      message: "адрес не нашёлся на карте, расстояние считаем до точки покупателя",
    });
    return { point: client, precision: "client", provider: "client" };
  }
  throw new AppError(400, DELIVERY_ADDRESS_NOT_FOUND_MESSAGE);
}

/**
 * Откуда везёт продавец.
 *
 * Сначала координаты с товара — именно от этой точки продавец поедет. Товары
 * сортируем по id, чтобы котировка в корзине и заказ выбрали одну и ту же
 * точку при любом порядке строк. Дальше — точки из профиля продавца, затем
 * поиск адреса продажи на карте и, в самом конце, адрес профиля.
 *
 * @param {{
 *   sellerId: string;
 *   productRows: Array<{
 *     id: string;
 *     productPickupLat?: unknown;
 *     productPickupLon?: unknown;
 *     productPickupAddress?: unknown;
 *   }>;
 * }} input
 * @returns {Promise<{ point: { lat: number; lon: number }; provider: string }>}
 */
export async function resolveDeliveryOrigin({ sellerId, productRows }) {
  const rows = [...(Array.isArray(productRows) ? productRows : [])].sort(
    (left, right) => String(left.id).localeCompare(String(right.id)),
  );
  for (const row of rows) {
    const point = toPoint({ lat: row.productPickupLat, lon: row.productPickupLon });
    if (point) {
      return { point, provider: "product" };
    }
  }

  const seller = await UserModel.findById(sellerId)
    .select("sellerFulfillmentDefaults.pickupLocations userAddress userAddressGeo")
    .lean();
  const locations = Array.isArray(seller?.sellerFulfillmentDefaults?.pickupLocations)
    ? [...seller.sellerFulfillmentDefaults.pickupLocations].sort(
        (left, right) =>
          Number(right?.isDefault === true) - Number(left?.isDefault === true),
      )
    : [];
  for (const location of locations) {
    const point = toPoint(location);
    if (point) {
      return { point, provider: "seller_profile" };
    }
  }

  const addresses = [
    ...rows.map((row) => row.productPickupAddress),
    ...locations.map((location) => location?.address),
    seller?.userAddress,
  ]
    .map((value) => String(value ?? "").trim())
    .filter((value, index, list) => value && list.indexOf(value) === index);

  for (const address of addresses) {
    let verified = null;
    try {
      verified = await verifyRuDeliveryAddress({ addressLine: address });
    } catch {
      // Неполный по мнению DaData адрес всё ещё может найтись в OSM.
    }
    const found = await geocodeAddressBest({ line: address, verified });
    if (found) {
      return { point: found.point, provider: `address:${found.provider}` };
    }
  }

  const profilePoint = toPoint(seller?.userAddressGeo);
  if (profilePoint) {
    return { point: profilePoint, provider: "seller_address" };
  }

  throw new AppError(409, DELIVERY_ORIGIN_NOT_FOUND_MESSAGE);
}
