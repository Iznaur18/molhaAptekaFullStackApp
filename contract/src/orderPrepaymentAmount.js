/**
 * Сколько покупатель платит по СБП за заказ с предоплатой.
 *
 * Товары плюс доставка по тарифу продавца. Курьерская сумма (`deliveryFeeRub`)
 * сюда не входит: её покупатель отдаёт курьеру из рук в руки, площадка её не
 * проводит. Одна формула и для счёта на сервере, и для суммы на кнопке
 * «Оплатить» — иначе покупатель видел бы одно, а платил другое.
 *
 * @param {{
 *   totalAmount?: number | null;
 *   shipments?: Array<{ sellerDeliveryFeeRub?: number | null } | null> | null;
 * } | null | undefined} order
 * @returns {number}
 */
export function resolveOrderPrepaymentAmountRub(order) {
  const deliveryTotalRub = (
    Array.isArray(order?.shipments) ? order.shipments : []
  ).reduce((sum, row) => sum + (Number(row?.sellerDeliveryFeeRub) || 0), 0);
  return (Number(order?.totalAmount) || 0) + deliveryTotalRub;
}
