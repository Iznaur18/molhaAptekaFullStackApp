import { z } from "zod";

/**
 * Тариф собственной доставки продавца.
 *
 * Действует только когда продавец везёт сам (`PRODUCT_DELIVERY_CARRIER_SELLER`):
 * у курьеров Gitorg сумму называет покупатель, у внешней службы — сама служба.
 *
 * Формула живёт здесь, а не на сервере, намеренно: покупатель должен видеть в
 * корзине ровно ту сумму, которую потом посчитает `createOrder`. Разойдись
 * они — и это спор о деньгах, а не расхождение в вёрстке.
 */

export const SELLER_DELIVERY_BASE_FEE_MAX_RUB = 100_000;
export const SELLER_DELIVERY_PER_KM_MAX_RUB = 10_000;
export const SELLER_DELIVERY_FREE_FROM_MAX_RUB = 10_000_000;

/**
 * Длиннее этого маршрута в России не бывает (Калининград — Магадан короче).
 *
 * Раньше здесь стояла тысяча «против мусорных координат», и покупатель из
 * Москвы у продавца из Грозного платил только за вызов: 999,5 км — 30 180 ₽,
 * 1000,2 км — 180 ₽. Теперь расстояние считает сервер по дорогам от точек,
 * которые он нашёл сам, так что граница защищает лишь от явной ошибки в числе.
 */
export const SELLER_DELIVERY_MAX_DISTANCE_KM = 20_000;

/** Маршрут построен по дорогам. */
export const SELLER_DELIVERY_DISTANCE_SOURCE_ROAD = "road";

/**
 * Ни один маршрутизатор не ответил: прямая с поправкой на извилистость дорог.
 * Сумма всё равно считается — оставить заказ без неё хуже.
 */
export const SELLER_DELIVERY_DISTANCE_SOURCE_ESTIMATE = "estimate";

/** @type {readonly ["road", "estimate"]} */
export const SELLER_DELIVERY_DISTANCE_SOURCES = [
  SELLER_DELIVERY_DISTANCE_SOURCE_ROAD,
  SELLER_DELIVERY_DISTANCE_SOURCE_ESTIMATE,
];

export const SELLER_DELIVERY_TARIFF_EMPTY_MESSAGE =
  "Укажите цену за вызов или цену за километр — иначе доставка бесплатная";

export const SELLER_DELIVERY_TARIFF_CARRIER_MESSAGE =
  "Тариф доставки задаётся только когда вы везёте сами";

export const sellerDeliveryTariffSchema = z
  .object({
    /**
     * false — доставка бесплатная, остальные поля не участвуют.
     *
     * Не `z.coerce.boolean()`: тот делает `Boolean("false") === true`, и
     * клиент, приславший флаг строкой, включил бы платную доставку, выключая её.
     */
    paid: z.preprocess(
      (value) => (value === "false" ? false : value === "true" ? true : value),
      z.boolean(),
    ),
    /** Цена за вызов: берётся всегда, сколько бы ни было километров. */
    baseFeeRub: z.coerce
      .number()
      .int("Цена за вызов — целое число рублей")
      .min(0)
      .max(SELLER_DELIVERY_BASE_FEE_MAX_RUB),
    /** Цена за километр сверх вызова. */
    perKmRub: z.coerce
      .number()
      .int("Цена за километр — целое число рублей")
      .min(0)
      .max(SELLER_DELIVERY_PER_KM_MAX_RUB),
    /**
     * От какой суммы заказа доставка бесплатна. 0 — порога нет.
     *
     * Сравнивается со стоимостью товаров, без самой доставки: иначе порог
     * зависел бы от расстояния и покупатель не мог бы до него дотянуться.
     */
    freeFromRub: z.coerce
      .number()
      .int("Сумма для бесплатной доставки — целое число рублей")
      .min(0)
      .max(SELLER_DELIVERY_FREE_FROM_MAX_RUB),
  })
  .superRefine((tariff, ctx) => {
    if (tariff.paid && tariff.baseFeeRub === 0 && tariff.perKmRub === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["baseFeeRub"],
        message: SELLER_DELIVERY_TARIFF_EMPTY_MESSAGE,
      });
    }
  });

/** Бесплатная доставка: продавец либо не включал тариф, либо выключил плату. */
export const FREE_SELLER_DELIVERY_TARIFF = {
  paid: false,
  baseFeeRub: 0,
  perKmRub: 0,
  freeFromRub: 0,
};

/**
 * @param {unknown} raw
 * @param {number} max
 */
function toWholeRub(raw, max) {
  const value = Math.floor(Number(raw));
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.min(value, max);
}

/**
 * Тариф в нормальном виде. Никогда не `null`: «нет тарифа» — это бесплатно.
 *
 * @param {{
 *   paid?: boolean | null;
 *   baseFeeRub?: unknown;
 *   perKmRub?: unknown;
 *   freeFromRub?: unknown;
 * } | null | undefined} raw
 */
export function normalizeSellerDeliveryTariff(raw) {
  if (!raw || typeof raw !== "object" || raw.paid !== true) {
    return { ...FREE_SELLER_DELIVERY_TARIFF };
  }
  const baseFeeRub = toWholeRub(raw.baseFeeRub, SELLER_DELIVERY_BASE_FEE_MAX_RUB);
  const perKmRub = toWholeRub(raw.perKmRub, SELLER_DELIVERY_PER_KM_MAX_RUB);
  if (baseFeeRub === 0 && perKmRub === 0) {
    // Платный тариф без единой ненулевой цены неотличим от бесплатного.
    return { ...FREE_SELLER_DELIVERY_TARIFF };
  }
  return {
    paid: true,
    baseFeeRub,
    perKmRub,
    freeFromRub: toWholeRub(raw.freeFromRub, SELLER_DELIVERY_FREE_FROM_MAX_RUB),
  };
}

/**
 * Тариф продавца из его профиля.
 *
 * @param {{ sellerFulfillmentDefaults?: { deliveryTariff?: unknown } | null } | null | undefined} user
 */
export function resolveSellerDeliveryTariff(user) {
  return normalizeSellerDeliveryTariff(user?.sellerFulfillmentDefaults?.deliveryTariff);
}

/**
 * Сколько покупатель платит за доставку.
 *
 * `distanceKm` — расстояние по дорогам, его считает сервер (корзина получает
 * его котировкой). Пока покупатель не выбрал адрес, расстояния нет: тогда
 * отдаём цену за вызов как нижнюю границу — показать «от N ₽» честнее, чем
 * показать ноль и удивить человека на оформлении. В заказ оценка не попадает:
 * сервер к этому моменту расстояние уже посчитал.
 *
 * @param {{
 *   tariff: unknown;
 *   goodsTotalRub?: number;
 *   distanceKm?: number | null;
 * }} input
 * @returns {{ feeRub: number; isFree: boolean; isEstimate: boolean; distanceKm: number | null }}
 */
export function calculateSellerDeliveryFee({
  tariff,
  goodsTotalRub = 0,
  distanceKm = null,
}) {
  const normalized = normalizeSellerDeliveryTariff(tariff);
  if (!normalized.paid) {
    return { feeRub: 0, isFree: true, isEstimate: false, distanceKm: null };
  }

  const goods = Number(goodsTotalRub) || 0;
  if (normalized.freeFromRub > 0 && goods >= normalized.freeFromRub) {
    return { feeRub: 0, isFree: true, isEstimate: false, distanceKm: null };
  }

  const rawDistance = Number(distanceKm);
  const hasDistance =
    distanceKm != null &&
    Number.isFinite(rawDistance) &&
    rawDistance >= 0 &&
    rawDistance <= SELLER_DELIVERY_MAX_DISTANCE_KM;

  if (normalized.perKmRub === 0) {
    // Километраж не участвует — сумма известна точно даже без адреса.
    return {
      feeRub: normalized.baseFeeRub,
      isFree: false,
      isEstimate: false,
      distanceKm: hasDistance ? rawDistance : null,
    };
  }

  if (!hasDistance) {
    return {
      feeRub: normalized.baseFeeRub,
      isFree: false,
      isEstimate: true,
      distanceKm: null,
    };
  }

  // Неполный километр считаем полным: продавец едет его целиком.
  const billableKm = Math.ceil(rawDistance);
  return {
    feeRub: normalized.baseFeeRub + billableKm * normalized.perKmRub,
    isFree: false,
    isEstimate: false,
    distanceKm: rawDistance,
  };
}

/**
 * Координата или `null`.
 *
 * `Number(null)` и `Number("")` дают 0 — без явной проверки на пустое
 * значение точка без координаты читается как валидный ноль (Гвинейский
 * залив). На этой мелочи уже ловились и точки самовывоза, и километраж
 * доставки, поэтому проверка живёт в одном месте.
 *
 * @param {unknown} raw
 * @returns {number | null}
 */
export function normalizeGeoCoord(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Расстояние по прямой между двумя точками.
 *
 * Для тарифа не используется напрямую — тариф считается по дорогам на сервере.
 * Нужно как запасная оценка, когда маршрутизаторы не отвечают, и чтобы понять,
 * насколько клиентская точка отстоит от найденной по адресу.
 *
 * @param {{ lat?: unknown; lon?: unknown } | null | undefined} from
 * @param {{ lat?: unknown; lon?: unknown } | null | undefined} to
 * @returns {number | null}
 */
export function sellerDeliveryDistanceKm(from, to) {
  const lat1 = normalizeGeoCoord(from?.lat);
  const lon1 = normalizeGeoCoord(from?.lon);
  const lat2 = normalizeGeoCoord(to?.lat);
  const lon2 = normalizeGeoCoord(to?.lon);
  if ([lat1, lon1, lat2, lon2].some((value) => value === null)) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}
