/**
 * Одна позиция в `items` заказа (`server/models/OrderModel.js`).
 *
 * @typedef {object} OrderLineItem
 * @property {string} productId
 * @property {number} quantity
 */

/**
 * Заказ в JSON (lean), соответствует `Order` в `server/models/OrderModel.js`.
 * `deliveryDate` в ответе API — ISO-строка, как у остальных дат.
 *
 * @typedef {object} Order
 * @property {string} _id
 * @property {string} userBuyerId
 * @property {OrderLineItem[]} items
 * @property {number} totalAmount
 * @property {string} deliveryAddress
 * @property {string} deliveryDate
 * @property {string} paymentMethod
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
