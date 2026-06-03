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
 * Товар из `GET /product` (lean + populate).
 *
 * @typedef {object} ProductFromApi
 * @property {string} _id
 * @property {string} productName
 * @property {string} [productDescription]
 * @property {ProductCharacteristic[]} [productCharacteristics]
 * @property {string[]} [productImageUrls]
 * @property {string} [productImageUrl]
 * @property {string} [productPreviewVideoUrl]
 * @property {number} productPrice
 * @property {number | null} [productOldPrice]
 * @property {number | null} [discountPercent]
 * @property {ProductSellerPopulated|string} productSeller
 * @property {ProductCategory} productCategory
 * @property {boolean} productIsAvailable
 * @property {number} [productStockQuantity]
 * @property {number} [productAvailableQuantity] — остаток с учётом резерва в заказах
 * @property {boolean} [productAuctionEnabled]
 * @property {boolean} [productInstallmentEnabled]
 * @property {boolean} [productAuctionCompletedOnce]
 * @property {boolean} [auctionActive] — enabled && approved && available
 * @property {'pending'|'approved'|'rejected'} [productModerationStatus]
 * @property {string} [productModerationComment]
 * @property {boolean} [hasOpenSales] — незавершённые продажи (`GET /product/my`, для admin — `GET /product`)
 * @property {number} [uniqueViewerCount]
 * @property {number} [soldQuantity] — сумма `quantity` по позициям `confirmed`/`delivered`
 * @property {number} [averageRating]
 * @property {number} [reviewCount]
 * @property {string | null} [catalogPromotionActivatedAt]
 * @property {string | null} [catalogPromotionExpiresAt]
 * @property {string | null} [activeRaffleId]
 * @property {string | null} [raffleParticipationEnabledAt]
 * @property {number} [loyaltyPointsPerUnit] — баллов продавца за 1 шт. премиум-покупателю
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
