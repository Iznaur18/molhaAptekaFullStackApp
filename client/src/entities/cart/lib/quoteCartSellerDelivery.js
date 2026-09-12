import {
  calculateSellerDeliveryFee,
  normalizeSellerDeliveryTariff,
} from "@molha/api-contract";

/**
 * Котировка доставки продавца для dock / блока на оформлении.
 *
 * Расстояние по дорогам приходит с сервера (`POST /order/seller-delivery-quote`)
 * — тем же расчётом, что и в заказе. Здесь из него, тарифа и стоимости товаров
 * собирается сумма функцией контракта. Пока расстояния нет — оценка «от».
 *
 * @param {{
 *   tariff: unknown;
 *   distanceKm?: number | null;
 *   goodsTotalRub?: number;
 * }} input
 * @returns {{
 *   feeRub: number;
 *   isFree: boolean;
 *   isEstimate: boolean;
 *   goodsTotalRub: number;
 *   payableRub: number;
 * } | null}
 */
export function quoteCartSellerDelivery({
  tariff,
  distanceKm = null,
  goodsTotalRub = 0,
}) {
  const normalized = normalizeSellerDeliveryTariff(tariff);
  if (!normalized.paid) {
    return null;
  }

  const goods = Number(goodsTotalRub) || 0;
  const { feeRub, isFree, isEstimate } = calculateSellerDeliveryFee({
    tariff: normalized,
    goodsTotalRub: goods,
    distanceKm,
  });

  return {
    feeRub,
    isFree,
    isEstimate,
    goodsTotalRub: goods,
    payableRub: goods + feeRub,
  };
}
