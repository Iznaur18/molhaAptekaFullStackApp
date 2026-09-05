import {
  ORDER_FULFILLMENT_DELIVERY,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  normalizeGeoCoord,
  normalizeSellerDeliveryTariff,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";

/**
 * Данные для расчёта доставки продавца на оформлении.
 *
 * `null` — доставки по тарифу нет: либо покупатель забирает сам, либо везёт
 * не продавец, либо продавец возит бесплатно. Во всех трёх случаях блок с
 * ценой на чекауте показывать нечего.
 *
 * Точку отправления берём с товара, а не из профиля продавца: именно она
 * синхронизирована с профилем и именно от неё продавец поедет, а у товара с
 * индивидуальным адресом она своя.
 *
 * @param {{
 *   sellerGroups: Array<{
 *     sellerId: string;
 *     lines: Array<{ product?: Record<string, any> }>;
 *   }>;
 *   fulfillmentBySellerId?: Record<string, string>;
 *   goodsTotalRub?: number;
 * }} input
 */
export function resolveCartSellerDelivery({
  sellerGroups,
  fulfillmentBySellerId = {},
  goodsTotalRub = 0,
}) {
  const groups = Array.isArray(sellerGroups) ? sellerGroups : [];
  // Тариф — свойство одного продавца. В сборной корзине показывать «доставку
  // продавцом» без уточнения, чьей именно, значит обмануть в сумме.
  if (groups.length !== 1) {
    return null;
  }

  const [group] = groups;
  if (fulfillmentBySellerId?.[group.sellerId] !== ORDER_FULFILLMENT_DELIVERY) {
    return null;
  }

  const products = (Array.isArray(group.lines) ? group.lines : [])
    .map((line) => line?.product)
    .filter(Boolean);

  const carrierProduct = products.find(
    (product) =>
      resolveProductDeliveryCarrier(product) === PRODUCT_DELIVERY_CARRIER_SELLER,
  );
  if (!carrierProduct) {
    return null;
  }

  const seller = carrierProduct.productSeller;
  const tariff = normalizeSellerDeliveryTariff(
    typeof seller === "object" && seller
      ? seller.sellerFulfillmentDefaults?.deliveryTariff
      : null,
  );
  if (!tariff.paid) {
    return null;
  }

  const lat = normalizeGeoCoord(carrierProduct.productPickupLat);
  const lon = normalizeGeoCoord(carrierProduct.productPickupLon);

  return {
    tariff,
    origin: lat != null && lon != null ? { lat, lon } : null,
    goodsTotalRub: Number(goodsTotalRub) || 0,
  };
}
