/**
 * @typedef {object} PriceOfferDashboardProduct
 * @property {string} _id
 * @property {string} productName
 * @property {string | null} [productImageUrl]
 * @property {string[]} [productImageUrls]
 * @property {boolean} [auctionActive]
 */

/**
 * @typedef {PriceOfferDashboardProduct} PriceOfferProductPreview
 */

/**
 * @typedef {object} PriceOfferBuyerBidRow
 * @property {string} _id
 * @property {string} productId
 * @property {PriceOfferDashboardProduct | null} [product]
 * @property {number} offerPrice
 * @property {'pending' | 'accepted' | 'rejected' | 'cancelled'} status
 * @property {string} [createdAt]
 * @property {string | null} [paymentDeadlineAt]
 */

/**
 * @typedef {object} PriceOfferIncomingRow
 * @property {string} _id
 * @property {string} productId
 * @property {PriceOfferDashboardProduct | null} [product]
 * @property {number} offerPrice
 * @property {'pending' | 'accepted' | 'rejected' | 'cancelled'} status
 * @property {string} [createdAt]
 * @property {string | null} [paymentDeadlineAt]
 * @property {{ _id: string; userName?: string; isPremiumUser?: boolean; isUserDataConfirmed?: boolean } | null} [buyer]
 */

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
