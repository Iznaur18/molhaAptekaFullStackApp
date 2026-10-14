/**
 * Корзина по отправлениям: одно на продавца. Логика одна для сайта и
 * приложения — живёт в `@izibuy/shared-lib`.
 *
 * @typedef {import("./selectCartLines.js").CartLine} CartLine
 * @typedef {import("@izibuy/shared-lib").CartSellerGroup<CartLine>} CartSellerGroup
 */
export {
  groupCartLinesBySeller,
  resolveCartFulfillmentBySeller,
} from "@izibuy/shared-lib";
