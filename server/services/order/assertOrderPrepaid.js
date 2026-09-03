import { ORDER_PAYMENT_METHOD_CARD_PREPAID } from "../../constants/orderConstants.js";
import { AppError } from "../../errors/AppError.js";

export const ORDER_NOT_PREPAID_MESSAGE =
  "Заказ ещё не оплачен — дождитесь оплаты, прежде чем собирать и отгружать";

/**
 * Оплачен ли заказ, если он оформлен с предоплатой картой.
 *
 * Наличные и перевод при получении сюда не попадают: там оплата и есть
 * вручение, и требовать её заранее нечего.
 *
 * @param {{ paymentMethod?: string; prepaidPaidAt?: unknown } | null | undefined} order
 */
export function isOrderAwaitingPrepayment(order) {
  if (!order) return false;
  return (
    order.paymentMethod === ORDER_PAYMENT_METHOD_CARD_PREPAID && !order.prepaidPaidAt
  );
}

/**
 * Не даёт двигать неоплаченный заказ вперёд.
 *
 * Пока деньги не пришли, отгружать нечего: иначе продавец отдаёт товар в
 * обмен на обещание, а покупателю достаточно закрыть форму оплаты.
 *
 * Отмену и возврат намеренно не трогаем — их как раз и надо разрешать на
 * неоплаченном заказе.
 *
 * @param {{ paymentMethod?: string; prepaidPaidAt?: unknown } | null | undefined} order
 */
export function assertOrderPrepaid(order) {
  if (isOrderAwaitingPrepayment(order)) {
    throw new AppError(409, ORDER_NOT_PREPAID_MESSAGE);
  }
}
