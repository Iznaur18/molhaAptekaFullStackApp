import {
  FREE_SELLER_DELIVERY_TARIFF,
  ORDER_FULFILLMENT_DELIVERY,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  calculateSellerDeliveryFee,
  resolveSellerDeliveryTariff,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { resolveRoadDistanceKm } from "../shipping/geo/roadRouter.js";

import {
  resolveDeliveryDestination,
  resolveDeliveryOrigin,
} from "./resolveDeliveryPoints.js";

export const SELLER_DELIVERY_DISTANCE_UNAVAILABLE_MESSAGE =
  "Не удалось посчитать расстояние доставки — попробуйте оформить заказ ещё раз";

/**
 * Стоимость доставки по тарифу продавца — на каждое отправление.
 *
 * Считается на сервере заново, а не принимается с клиента: иначе сумму
 * доставки можно было бы обнулить, подправив запрос.
 *
 * Тариф работает только у собственной доставки: у курьеров Gitorg сумму
 * называет покупатель (`deliveryFeeRub`), у внешней службы — сама служба.
 *
 * Расчёт в два шага. Расстояние по дорогам требует походов во внешние
 * геосервисы, и держать ради них открытую транзакцию Mongo нельзя, — поэтому
 * `prepareSellerDeliveryBySeller` зовётся до транзакции. Сумма зависит ещё и
 * от стоимости товаров (порог «бесплатно от»), которая известна только внутри
 * неё, — это `resolveSellerDeliveryFeesBySeller`.
 */

/**
 * @typedef {{
 *   tariff: typeof FREE_SELLER_DELIVERY_TARIFF;
 *   distanceKm: number | null;
 *   distanceSource: string | null;
 * }} PreparedSellerDelivery
 */

/**
 * Тариф и расстояние по дорогам — по продавцам, которые везут сами.
 *
 * Расстояние считаем, только когда за километр берут деньги: у тарифа «только
 * вызов» и у бесплатной доставки оно на сумму не влияет, и ходить за ним во
 * внешние сервисы незачем.
 *
 * @param {{
 *   fulfillmentBySellerId: Record<string, string>;
 *   deliveryCarrierBySellerId: Record<string, string>;
 *   productById: Record<string, { sellerId?: string; productPickupLat?: unknown; productPickupLon?: unknown; productPickupAddress?: unknown }>;
 *   deliveryAddress: Parameters<typeof resolveDeliveryDestination>[0]["verifiedAddress"];
 *   clientGeo?: { lat?: unknown; lon?: unknown } | null;
 * }} input
 * @returns {Promise<Record<string, PreparedSellerDelivery>>}
 */
export async function prepareSellerDeliveryBySeller({
  fulfillmentBySellerId,
  deliveryCarrierBySellerId,
  productById,
  deliveryAddress,
  clientGeo = null,
}) {
  const sellerIds = Object.entries(fulfillmentBySellerId ?? {})
    .filter(
      ([sellerId, method]) =>
        method === ORDER_FULFILLMENT_DELIVERY &&
        deliveryCarrierBySellerId?.[sellerId] === PRODUCT_DELIVERY_CARRIER_SELLER,
    )
    .map(([sellerId]) => sellerId);

  if (sellerIds.length === 0) {
    return {};
  }

  const sellers = await UserModel.find({ _id: { $in: sellerIds } })
    .select("sellerFulfillmentDefaults.deliveryTariff")
    .lean();

  /** @type {Record<string, ReturnType<typeof resolveSellerDeliveryTariff>>} */
  const tariffBySeller = {};
  for (const seller of sellers) {
    tariffBySeller[String(seller._id)] = resolveSellerDeliveryTariff(seller);
  }

  /** Адрес покупателя один на заказ — ищем его один раз. */
  let destination = null;
  /** @type {Record<string, PreparedSellerDelivery>} */
  const result = {};

  for (const sellerId of sellerIds) {
    const tariff = tariffBySeller[sellerId] ?? { ...FREE_SELLER_DELIVERY_TARIFF };
    /** @type {PreparedSellerDelivery} */
    const entry = { tariff, distanceKm: null, distanceSource: null };

    if (tariff.paid && tariff.perKmRub > 0) {
      destination ??= await resolveDeliveryDestination({
        verifiedAddress: deliveryAddress,
        clientGeo,
      });
      const origin = await resolveDeliveryOrigin({
        sellerId,
        productRows: Object.entries(productById ?? {})
          .filter(([, row]) => String(row?.sellerId ?? "") === sellerId)
          .map(([id, row]) => ({ ...row, id })),
      });
      const route = await resolveRoadDistanceKm(origin.point, destination.point);
      entry.distanceKm = route.distanceKm;
      entry.distanceSource = route.source;
    }

    result[sellerId] = entry;
  }

  return result;
}

/**
 * Сумма доставки по подготовленным тарифу и расстоянию.
 *
 * @param {{
 *   preparedBySellerId: Record<string, PreparedSellerDelivery>;
 *   goodsTotalBySellerId: Record<string, number>;
 * }} input
 * @returns {Record<string, {
 *   feeRub: number;
 *   distanceKm: number | null;
 *   distanceSource: string | null;
 *   tariff: typeof FREE_SELLER_DELIVERY_TARIFF;
 * }>}
 */
export function resolveSellerDeliveryFeesBySeller({
  preparedBySellerId,
  goodsTotalBySellerId,
}) {
  /** @type {ReturnType<typeof resolveSellerDeliveryFeesBySeller>} */
  const result = {};
  for (const [sellerId, prepared] of Object.entries(preparedBySellerId ?? {})) {
    const calculated = calculateSellerDeliveryFee({
      tariff: prepared.tariff,
      goodsTotalRub: goodsTotalBySellerId?.[sellerId] ?? 0,
      distanceKm: prepared.distanceKm,
    });
    // «От N ₽» годится корзине, пока адрес не выбран, но не счёту: к этому
    // месту расстояние обязано быть посчитано. Молча выставить одну цену за
    // вызов — ровно та ошибка, из-за которой это переписывалось.
    if (calculated.isEstimate) {
      throw new AppError(400, SELLER_DELIVERY_DISTANCE_UNAVAILABLE_MESSAGE);
    }
    result[sellerId] = {
      feeRub: calculated.feeRub,
      distanceKm: prepared.distanceKm,
      distanceSource: prepared.distanceSource,
      tariff: prepared.tariff,
    };
  }
  return result;
}

/**
 * Стоимость товаров по продавцам — база для порога «бесплатно от суммы».
 *
 * Считается по позициям заказа, а не по корзине: между корзиной и оформлением
 * состав мог измениться, и порог должен сравниваться с тем, что реально
 * заказано.
 *
 * @param {Array<Record<string, any>>} pricedItems
 * @returns {Record<string, number>}
 */
export function buildGoodsTotalBySeller(pricedItems) {
  /** @type {Record<string, number>} */
  const totals = {};
  for (const item of Array.isArray(pricedItems) ? pricedItems : []) {
    const sellerId = item?.sellerIdAtOrder == null ? "" : String(item.sellerIdAtOrder);
    if (!sellerId) continue;
    const unitPrice = Number(item.unitPriceAtOrder) || 0;
    const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
    // Бесплатные единицы по «N+1» покупатель не оплачивает — в порог они и
    // не должны засчитываться, иначе акция сама себе открывала бы бесплатную
    // доставку.
    const freeUnits = Math.max(0, Math.floor(Number(item.buyNFreeUnitsAtOrder) || 0));
    totals[sellerId] =
      (totals[sellerId] ?? 0) + unitPrice * Math.max(0, quantity - freeUnits);
  }
  return totals;
}
