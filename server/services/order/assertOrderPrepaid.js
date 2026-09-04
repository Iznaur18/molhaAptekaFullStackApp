import {
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_STATUS_PENDING,
  ORDER_TERMINAL_STATUSES,
} from "../../constants/orderConstants.js";
import { AppError } from "../../errors/AppError.js";

export const ORDER_NOT_PREPAID_MESSAGE =
  "Заказ ещё не оплачен — дождитесь оплаты, прежде чем собирать и отгружать";

export const ORDER_NOT_ACCEPTED_MESSAGE =
  "Продавец ещё не подтвердил заказ — оплата откроется после подтверждения";

const TERMINAL = new Set(ORDER_TERMINAL_STATUSES);

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
 * Подтвердил ли продавец заказ.
 *
 * Оплата открывается только после подтверждения: продавец сначала проверяет,
 * что товар есть, и лишь потом покупатель платит. Иначе на каждый «нет в
 * наличии» приходился бы возврат денег — руками, через кабинет банка.
 *
 * Отменённые и возвращённые позиции не считаем: продавец про них уже решил.
 *
 * @param {{ items?: { status?: string }[] } | null | undefined} order
 */
export function isOrderAcceptedBySeller(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const active = items.filter((item) => !TERMINAL.has(item?.status));
  if (active.length === 0) return false;
  return active.every((item) => item?.status !== ORDER_STATUS_PENDING);
}

/**
 * Не даёт двигать неоплаченный заказ дальше подтверждения.
 *
 * Подтвердить заказ продавец может и до оплаты — это и есть его «товар есть,
 * можно платить». А вот собирать и отгружать за обещание нельзя: покупателю
 * достаточно закрыть форму оплаты.
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

/**
 * Не даёт оплатить заказ, который продавец ещё не подтвердил.
 *
 * @param {{ items?: { status?: string }[] } | null | undefined} order
 */
export function assertOrderAcceptedBySeller(order) {
  if (!isOrderAcceptedBySeller(order)) {
    throw new AppError(409, ORDER_NOT_ACCEPTED_MESSAGE);
  }
}
