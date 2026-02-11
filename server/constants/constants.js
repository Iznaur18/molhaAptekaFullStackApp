/** URL аватара по умолчанию для пользователя */
export const DEFAULT_AVATAR_URL = 'https://i.pinimg.com/originals/c9/31/92/c93192b782081d4d1d70b03a3c1cf011.jpg';
/** URL фонового изображения по умолчанию для пользователя */
export const DEFAULT_BACKGROUND_URL = 'https://krisp.ai/blog/wp-content/uploads/2024/07/background-meme1.jpg';

/** Поля пользователя для отображения на клиенте (GET /me). Строка для .select() — без passwordHash */
export const USER_DATA = '_id userName email userAvatarUrl userBackgroundUrl userBirthDate userGender userAddress userPhoneNumber userRole userDiscountPercent userLoyaltyPoints isPremiumUser notificationsEnabled userRatingByVotes telegramUserId telegramUsername telegramPhotoUrl isActiveUser isBlockedUser createdAt updatedAt userLastLoginAt notesAboutUser';

export const USER_ME_RAITING =  "_id userRatingByVotes userName email userAvatarUrl";