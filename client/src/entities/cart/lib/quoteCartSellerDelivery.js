import {
  calculateSellerDeliveryFee,
  normalizeSellerDeliveryTariff,
  sellerDeliveryDistanceKm,
} from "@molha/api-contract";

/**
 * Котировка доставки продавца для dock / блока на оформлении.
 *
 * Без geo — оценка «от»; с geo — финальная сумма. Одна формула с сервером.
 *
 * @param {{
 *   tariff: unknown;
 *   origin?: { lat: number; lon: number } | null;
 *   deliveryGeo?: { lat: number; lon: number } | null;
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
  origin = null,
  deliveryGeo = null,
  goodsTotalRub = 0,
}) {
  const normalized = normalizeSellerDeliveryTariff(tariff);
  if (!normalized.paid) {
    return null;
  }

  const goods = Number(goodsTotalRub) || 0;
  const distanceKm = sellerDeliveryDistanceKm(origin, deliveryGeo);
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
