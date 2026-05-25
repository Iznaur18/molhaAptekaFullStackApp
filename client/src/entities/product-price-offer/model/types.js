/**
 * @typedef {object} PriceOfferTopEntry
 * @property {string} _id
 * @property {number} offerPrice
 * @property {string} [createdAt]
 * @property {{ _id: string; userName?: string } | null} buyer
 */

/**
 * @typedef {object} PriceOfferRow
 * @property {string} _id
 * @property {number} offerPrice
 * @property {'pending' | 'accepted' | 'rejected' | 'cancelled'} status
 * @property {string} [createdAt]
 * @property {string} [paymentDeadlineAt]
 * @property {string} [orderId] — заказ создан по принятой ставке
 * @property {import('../../user/model/types.js').UserSearchListItem | null} [buyerUserId]
 * @property {import('../../user/model/types.js').UserSearchListItem | null} [buyer]
 */

export {};
