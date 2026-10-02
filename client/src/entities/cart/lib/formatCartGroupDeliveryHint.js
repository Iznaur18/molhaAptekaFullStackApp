import {
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  resolveSellerDeliveryTariff,
} from "@molha/api-contract";

import {
  CART_DELIVERY_FEE_UI,
  CART_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * Короткая подпись о доставке в строке продавца — ещё до оформления.
 *
 * Раньше в списке продавцов была видна только сумма товаров, а цена
 * доставки всплывала уже внутри, на оформлении. Здесь — только то, что
 * известно заранее: тариф продавца, минимум курьеру, способ оплаты ЛОБО.
 * Точную цену СДЭК и Яндекса без пункта выдачи не узнать — о них молчим.
 *
 * @param {{
 *   deliveryAvailable?: boolean;
 *   deliveryCarrier?: string | null;
 *   lines?: Array<{ product?: Record<string, any> }>;
 * }} group
 * @param {number} goodsTotalRub сумма отмеченных товаров
 * @returns {string} пусто — подсказать нечего
 */
export function formatCartGroupDeliveryHint(group, goodsTotalRub) {
  if (!group?.deliveryAvailable) return "";

  switch (group.deliveryCarrier) {
    case PRODUCT_DELIVERY_CARRIER_SELLER: {
      const seller = (group.lines ?? []).find(
        (line) => typeof line?.product?.productSeller === "object",
      )?.product?.productSeller;
      const tariff = resolveSellerDeliveryTariff(seller);
      const freeByTotal =
        tariff.paid &&
        tariff.freeFromRub > 0 &&
        (Number(goodsTotalRub) || 0) >= tariff.freeFromRub;
      if (!tariff.paid || freeByTotal) return CART_PAGE_UI.DELIVERY_HINT_FREE;
      return tariff.baseFeeRub > 0
        ? CART_PAGE_UI.DELIVERY_HINT_FROM(formatPriceRub(tariff.baseFeeRub))
        : CART_PAGE_UI.DELIVERY_HINT_BY_TARIFF;
    }
    case PRODUCT_DELIVERY_CARRIER_GITORG:
      return CART_PAGE_UI.DELIVERY_HINT_COURIER(
        formatPriceRub(CART_DELIVERY_FEE_UI.MIN_RUB),
      );
    case PRODUCT_DELIVERY_CARRIER_LOBO:
      return CART_PAGE_UI.DELIVERY_HINT_LOBO;
    default:
      return "";
  }
}
