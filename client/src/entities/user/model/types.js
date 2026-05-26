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
 * @property {string} [telegramPhotoUrl]
 * @property {number} [userLoyaltyPoints]
 * @property {UserRatingByVotes} [userRatingByVotes]
 * @property {number} [followersCount]
 * @property {number} [followingCount]
 * @property {boolean} [isFollowing]
 * @property {'user'|'admin'|'moderator'} [userRole]
 * @property {boolean} [isPremiumUser]
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
 * Публичное представление пользователя (как документ User без `passwordHash`).
 * Совпадает с полями из `USER_DATA` в `server/constants/constants.js`.
 *
 * @typedef {object} UserPublicProfile
 * @property {string} _id
 * @property {string} [userName]
 * @property {string} [email]
 * @property {string|null} [userBirthDate]
 * @property {'male'|'female'|'noSelected'} [userGender]
 * @property {string} [userAddress]
 * @property {string} [userAddressFlat]
 * @property {string} [userAddressFiasId]
 * @property {{ lat?: number; lon?: number } | null} [userAddressGeo]
 * @property {string} [userPhoneNumber]
 * @property {string|null} [userLastLoginAt]
 * @property {string} [userAvatarUrl]
 * @property {{ x?: number; y?: number }} [userAvatarFocus]
 * @property {string} [userBackgroundUrl]
 * @property {{ x?: number; y?: number }} [userBackgroundFocus]
 * @property {boolean} [isActiveUser]
 * @property {boolean} [isUserDataConfirmed]
 * @property {boolean} [isBlockedUser]
 * @property {'user'|'admin'|'moderator'} [userRole]
 * @property {number} [userDiscountPercent]
 * @property {boolean} [notificationsEnabled]
 * @property {boolean} [isPremiumUser]
 * @property {string} [notesAboutUser]
 * @property {number} [userLoyaltyPoints]
 * @property {string[]} [buyList]
 * @property {UserRatingByVotes} [userRatingByVotes]
 * @property {number} [followersCount]
 * @property {number} [followingCount]
 * @property {boolean} [isFollowing]
 * @property {string} [telegramUserId]
 * @property {string} [telegramUsername]
 * @property {string} [telegramPhotoUrl]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

export {};
