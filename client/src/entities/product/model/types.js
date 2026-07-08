/**
 * @typedef {import('./productConstants.js').PRODUCT_CATEGORIES[number]} ProductCategory
 */

/**
 * @typedef {import('../../user/model/types.js').UserRatingByVotes} UserRatingByVotes
 */

/**
 * Продавец в ответах `GET /product` и связанных эндпоинтах.
 *
 * @typedef {object} ProductSellerPopulated
 * @property {string} _id
 * @property {string} [userName]
 * @property {string} [email]
 * @property {string} [userPhoneNumber]
 * @property {string} [userAddress]
 * @property {UserRatingByVotes} [userRatingByVotes]
 * @property {boolean} [isPremiumUser]
 * @property {boolean} [isUserDataConfirmed]
 * @property {string} [createdAt]
 * @property {number} [sellerListedProductCount] — одобренные и видимые в каталоге
 * @property {number} [totalSalesAmount]
 * @property {number} [followersCount]
 * @property {'user'|'admin'|'moderator'} [userRole]
 */

/**
 * Пара «ключ — значение» в карточке товара.
 *
 * @typedef {object} ProductCharacteristic
 * @property {string} key
 * @property {string} value
 */

/**
 * Товар из `GET /product` — `productFromApiSchema` (Zod) + passthrough с API.
 *
 * @typedef {import('@molha/api-contract/types').ProductFromApiContract} ProductFromApi
 */

export {};
