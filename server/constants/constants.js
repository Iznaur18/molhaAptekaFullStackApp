/** URL аватара по умолчанию для пользователя */
export const DEFAULT_AVATAR_URL = 'https://i.pinimg.com/originals/c9/31/92/c93192b782081d4d1d70b03a3c1cf011.jpg';
import { getDefaultUserBackgroundStoredValue } from './userBackgroundPresets.js';

/** Значение `userBackgroundUrl` по умолчанию (`preset:mist`). */
export const DEFAULT_BACKGROUND_URL = getDefaultUserBackgroundStoredValue();

/** Поля пользователя для отображения на клиенте (GET /me, GET /user/:id). Строка для .select() — без passwordHash */
export const USER_DATA = '_id userName email userAvatarUrl userAvatarFocus userBackgroundUrl userBackgroundFocus userBirthDate userGender userAddress userAddressFlat userAddressFiasId userAddressGeo userPhoneNumber userRole userDiscountPercent userLoyaltyPoints isPremiumUser isUserDataConfirmed notificationsEnabled userRatingByVotes telegramUserId telegramUsername telegramPhotoUrl isActiveUser isBlockedUser createdAt updatedAt userLastLoginAt notesAboutUser buyList';

/** Поля пользователя для отображения на клиенте (GET /me/rating). Строка для .select() — без passwordHash */
export const USER_ME_RAITING =  "_id userRatingByVotes userName email userAvatarUrl";

// Разрешённые поля для обычного пользователя, иначе возвращаются все поля такие как passwordHash, userRole, email, userPhoneNumber, isActiveUser, isBlockedUser
export const ALLOWED_FIELDS_FOR_USER = [
    'userName', 'userBirthDate', 'userGender', 
    'userAddress',
    'userAddressFlat',
    'userAddressFiasId',
    'userAddressGeo',
    'userPhoneNumber',
    'userAvatarUrl',
    'userAvatarFocus',
    'userBackgroundUrl',
    'userBackgroundFocus',
    'notificationsEnabled',
    'notesAboutUser',
  ];

/** Разрешённые поля для модератора при редактировании чужого профиля */
export const ALLOWED_FIELDS_FOR_MODERATOR = [
    ...ALLOWED_FIELDS_FOR_USER,
    'isActiveUser',
    'isBlockedUser',
    'isPremiumUser',
    'isUserDataConfirmed',
    'notesAboutUser',
];

/** Разрешённые поля для администратора */
export const ALLOWED_FIELDS_FOR_ADMIN = [
    ...ALLOWED_FIELDS_FOR_MODERATOR,
    'userRole',
    'userDiscountPercent',
];