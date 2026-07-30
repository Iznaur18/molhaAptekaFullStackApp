/**
 * Одна позиция заказа (после `populate('items.productId')` в API).
 *
 * @typedef {object} OrderLineItem
 * @property {string} [_id]
 * @property {string | { _id: string; productName?: string; productPrice?: number; productImageUrls?: string[]; productImageUrl?: string; productSeller?: { _id: string; userName?: string; userPhoneNumber?: string } | string }} productId
 * @property {number} quantity
 * @property {number} unitPriceAtOrder
 * @property {string} [productNameAtOrder] — снимок названия на момент заказа
 * @property {number} [itemIndex]
 * @property {import('./constants.js').ORDER_STATUSES[number]} status
 * @property {string | null} [deliveredAt]
 * @property {string | null} [confirmedAt]
 * @property {string | null | { _id: string; userName?: string }} [deliveredBy]
 * @property {string | null | { _id: string; userName?: string }} [confirmedBy]
 * @property {boolean} [loyaltyPointsAwarded]
 * @property {number} [loyaltyPointsEarned]
 * @property {number} [loyaltyPointsPerUnitAtOrder]
 * @property {number} [loyaltyPointsReservedTotal]
 * @property {boolean} [loyaltyPointsReserveReleased]
 */

/**
 * @typedef {object} ConfirmOrderItemResult
 * @property {Order} order
 * @property {number} pointsEarned
 */

/**
 * Снимок плана рассрочки для заказа (продажи продавца).
 *
 * @typedef {object} OrderInstallmentContractSummary
 * @property {string} planTitle
 * @property {number} monthsCount
 * @property {number} monthlyPaymentRub
 * @property {number} totalAmountRub
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
 * @property {"pickup" | "delivery"} [fulfillmentMethod]
 * @property {"cdek" | "yandex_delivery" | "russian_post" | null} [shippingProvider]
 * @property {"pickup_point" | "courier" | null} [shippingServiceType]
 * @property {string | null} [shippingTrackingNumber]
 * @property {string | null} [shippingTrackingUrl]
 * @property {string | null} [shippingExternalId]
 * @property {string | null} [shippingCarrierStatus]
 * @property {import('./constants.js').ORDER_PAYMENT_METHODS[number]} paymentMethod
 * @property {import('./constants.js').ORDER_STATUSES[number]} status
 * @property {string | null} [priceOfferId]
 * @property {string | null} [installmentContractId]
 * @property {OrderInstallmentContractSummary | null} [installmentContract]
 * @property {{
 *   passport: import('../../user-data-confirmation/model/types.js').PassportSnapshot;
 *   passportSelfiePhotoUrl?: string;
 *   consentAt?: string | null;
 * } | null} [buyerPassportShare]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
