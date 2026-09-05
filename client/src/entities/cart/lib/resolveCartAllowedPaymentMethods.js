import { ORDER_PAYMENT_METHODS } from "../../order/model/constants.js";

/**
 * Способы оплаты, доступные покупателю на этом оформлении.
 *
 * Продавец решает, что он принимает; покупатель видит только это. Пустой
 * список у продавца означает «не настраивал» — тогда принимает всё, иначе у
 * каждого, кто завёлся до появления настройки, чекаут остался бы без кнопок.
 *
 * Пересечение по группам, а не объединение: заказ всё равно оформляется по
 * одному продавцу, но если групп несколько, показать способ, который примет
 * только один из них, — значит пообещать то, что сервер отклонит.
 *
 * @param {Array<{ sellerPaymentMethods?: string[] }>} sellerGroups
 * @returns {string[]}
 */
export function resolveCartAllowedPaymentMethods(sellerGroups) {
  const groups = Array.isArray(sellerGroups) ? sellerGroups : [];
  if (groups.length === 0) {
    return [...ORDER_PAYMENT_METHODS];
  }

  return ORDER_PAYMENT_METHODS.filter((method) =>
    groups.every((group) => {
      const methods = Array.isArray(group?.sellerPaymentMethods)
        ? group.sellerPaymentMethods
        : [];
      return methods.length === 0 || methods.includes(method);
    }),
  );
}
