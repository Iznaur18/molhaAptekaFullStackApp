/**
 * Одна позиция заказа (после `populate('items.productId')` в API).
 *
 * @typedef {object} OrderLineItem
 * @property {string} [_id]
 * @property {string | { _id: string; productName?: string; productPrice?: number; productImageUrl?: string; productSeller?: { _id: string; userName?: string } | string }} productId
 * @property {number} quantity
 * @property {number} unitPriceAtOrder
 * @property {number} [itemIndex]
 * @property {import('./constants.js').ORDER_STATUSES[number]} status
 * @property {string | null} [deliveredAt]
 * @property {string | null} [confirmedAt]
 * @property {string | null | { _id: string; userName?: string }} [deliveredBy]
 * @property {string | null | { _id: string; userName?: string }} [confirmedBy]
 */

/**
 * Заказ из API. Соответствует `Order` в `server/models/OrderModel.js` после populate.
 *
 * @typedef {object} Order
 * @property {string} _id
 * @property {string | { _id: string; userName?: string; email?: string; userPhoneNumber?: string }} userBuyerId
 * @property {OrderLineItem[]} items
 * @property {number} totalAmount
 * @property {string} deliveryAddress
 * @property {import('./constants.js').ORDER_PAYMENT_METHODS[number]} paymentMethod
 * @property {import('./constants.js').ORDER_STATUSES[number]} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
