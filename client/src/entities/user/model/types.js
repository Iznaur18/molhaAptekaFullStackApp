/**
 * @typedef {object} UserRatingByVotes
 * @property {number} countVotes
 * @property {number} totalRating
 */

/**
 * Элемент списка из `GET /user/search` (подмножество полей User).
 *
 * @typedef {object} UserSearchListItem
 * @property {string} _id
 * @property {string} [userName]
 * @property {string} [email]
 * @property {string} [userAvatarUrl]
 * @property {{ x?: number; y?: number }} [userAvatarFocus]
 * @property {number} [userLoyaltyPoints]
 * @property {number} [userLoyaltyPointsReserved] — только GET /auth/me
 * @property {UserRatingByVotes} [userRatingByVotes]
 * @property {number} [followersCount]
 * @property {number} [followingCount]
 * @property {boolean} [isFollowing]
 * @property {'user'|'admin'|'moderator'} [userRole]
 * @property {boolean} [isPremiumUser]
 * @property {string | null} [premiumExpiresAt]
 * @property {boolean} [isActiveUser]
 * @property {boolean} [isUserDataConfirmed]
 * @property {boolean} [isBlockedUser]
 * @property {number} [totalSalesAmount] — сумма продаж (quantity × unitPriceAtOrder)
 * @property {number} [totalPurchasesAmount] — сумма покупок как покупателя
 */

/**
 * Поля, которые клиент может передать при `POST /auth/register`
 * (совпадают с разрешёнными ключами в теле запроса на сервере).
 *
 * @typedef {object} RegisterUserPayload
 * @property {string} email
 * @property {string} password
 * @property {string} passwordConfirm
 * @property {string} userName
 * @property {string} [phoneNumber]
 * @property {string} [avatarUrl]
 * @property {string} [backgroundPresetId]
 * @property {string} [userBirthDate] ISO 8601 (дата)
 * @property {'male'|'female'|'noSelected'} [userGender]
 * @property {string} [userAddress]
 * @property {string} [userAddressFlat]
 * @property {boolean} notificationsEnabled
 */

/**
 * Публичное представление пользователя — `userPublicProfileSchema` (Zod) + passthrough.
 *
 * @typedef {import('@molha/api-contract/types').UserPublicProfileContract} UserPublicProfile
 */

export {};
