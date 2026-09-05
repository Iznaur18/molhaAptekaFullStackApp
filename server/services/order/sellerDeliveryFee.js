import {
  FREE_SELLER_DELIVERY_TARIFF,
  ORDER_FULFILLMENT_DELIVERY,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  calculateSellerDeliveryFee,
  normalizeGeoCoord,
  resolveSellerDeliveryTariff,
  sellerDeliveryDistanceKm,
} from "@molha/api-contract";

import { UserModel } from "../../models/index.js";

/**
 * Стоимость доставки по тарифу продавца — на каждое отправление.
 *
 * Считается на сервере заново, а не принимается с клиента: корзина показывает
 * ту же формулу из контракта, но платит покупатель по серверному счёту.
 * Иначе сумму доставки можно было бы обнулить, подправив запрос.
 *
 * Тариф работает только у собственной доставки: у курьеров Gitorg сумму
 * называет покупатель (`deliveryFeeRub`), у внешней службы — сама служба.
 *
 * @param {{
 *   fulfillmentBySellerId: Record<string, string>;
 *   deliveryCarrierBySellerId: Record<string, string>;
 *   goodsTotalBySellerId: Record<string, number>;
 *   originBySellerId: Record<string, { lat: number | null; lon: number | null } | null>;
 *   deliveryAddressGeo?: { lat: number; lon: number } | null;
 * }} input
 * @returns {Promise<Record<string, {
 *   feeRub: number;
 *   distanceKm: number | null;
 *   tariff: typeof FREE_SELLER_DELIVERY_TARIFF;
 * }>>}
 */
export async function resolveSellerDeliveryFeesBySeller({
  fulfillmentBySellerId,
  deliveryCarrierBySellerId,
  goodsTotalBySellerId,
  originBySellerId,
  deliveryAddressGeo = null,
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

  /** @type {Record<string, { feeRub: number; distanceKm: number | null; tariff: any }>} */
  const result = {};
  for (const sellerId of sellerIds) {
    const tariff = tariffBySeller[sellerId] ?? { ...FREE_SELLER_DELIVERY_TARIFF };
    // Расстояние по прямой от точки продажи до адреса покупателя. Нет
    // координат — километраж не начисляем: брать его «примерно» значит
    // выставить счёт по догадке.
    const distanceKm = sellerDeliveryDistanceKm(
      originBySellerId?.[sellerId] ?? null,
      deliveryAddressGeo,
    );
    const calculated = calculateSellerDeliveryFee({
      tariff,
      goodsTotalRub: goodsTotalBySellerId?.[sellerId] ?? 0,
      distanceKm,
    });

    result[sellerId] = {
      feeRub: calculated.feeRub,
      distanceKm: calculated.distanceKm,
      tariff,
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

/**
 * Точка отправления по продавцу — из товаров заказа.
 *
 * У продавца может быть несколько точек; берём ту, что стоит на товаре, —
 * именно она синхронизирована с профилем и именно от неё он поедет.
 *
 * @param {Record<string, { sellerId?: string; productPickupLat?: unknown; productPickupLon?: unknown }>} productById
 * @returns {Record<string, { lat: number; lon: number } | null>}
 */
export function buildDeliveryOriginBySeller(productById) {
  /** @type {Record<string, { lat: number; lon: number } | null>} */
  const origins = {};
  for (const row of Object.values(productById ?? {})) {
    const sellerId = row?.sellerId == null ? "" : String(row.sellerId);
    if (!sellerId || origins[sellerId]) continue;
    // `Number(null)` === 0: без явной проверки на пустое значение товар без
    // координат получал бы точку 0,0 и километраж через полмира.
    const lat = normalizeGeoCoord(row.productPickupLat);
    const lon = normalizeGeoCoord(row.productPickupLon);
    origins[sellerId] = lat != null && lon != null ? { lat, lon } : null;
  }
  return origins;
}
