import { resolveProductDeliveryCarrier } from "@molha/api-contract";

/**
 * Везут ли товары разные службы доставки (свой курьер продавца, курьеры
 * Gitorg, ЛОБО).
 *
 * Такие товары одного продавца одной доставкой не оформить: сервер не знает,
 * кому отдавать отправление, и отвечает «нельзя смешивать разные службы».
 * Товары без доставки (только самовывоз) службы не задают и не считаются.
 *
 * @param {Array<Parameters<typeof resolveProductDeliveryCarrier>[0] | null | undefined>} products
 * @returns {boolean}
 */
export function hasMixedDeliveryCarriers(products) {
  const carriers = new Set();
  for (const product of Array.isArray(products) ? products : []) {
    const carrier = resolveProductDeliveryCarrier(product ?? {});
    if (carrier) {
      carriers.add(carrier);
    }
  }
  return carriers.size > 1;
}
