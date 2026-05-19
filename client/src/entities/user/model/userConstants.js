/** Как в `server/models/UserModel.js` — `userGender.enum`. */
export const USER_GENDER_MALE = "male";
export const USER_GENDER_FEMALE = "female";
export const USER_GENDER_NO_SELECTED = "noSelected";

export const USER_GENDER_LABEL_RU = {
  [USER_GENDER_MALE]: "Мужской",
  [USER_GENDER_FEMALE]: "Женский",
  [USER_GENDER_NO_SELECTED]: "Не указан",
};

/** Как в `server/validations/user/ruPhoneRules.js` — 7 + 10 цифр (РФ). */
export const RU_PHONE_MAX_DIGITS = 11;

/** Как в `server/validations/user/userNameRules.js`. */
export const USER_NAME_MIN_LENGTH = 3;
export const USER_NAME_MAX_LENGTH = 30;

/** Как `MAX_TEXT_FIELD_WORDS` в `server/utils/maxWordsText.js` (адрес, заметки). */
export const PROFILE_FIELD_MAX_WORDS = 10;

/** Как в `server/models/UserModel.js` — `userRole.enum`. */
export const USER_ROLE_USER = "user";
export const USER_ROLE_ADMIN = "admin";
export const USER_ROLE_MODERATOR = "moderator";

export const USER_ROLE_LABEL_RU = {
  [USER_ROLE_USER]: "Пользователь",
  [USER_ROLE_ADMIN]: "Администратор",
  [USER_ROLE_MODERATOR]: "Модератор",
};

/** Совпадает с `server/constants/constants.js`. */
export const DEFAULT_USER_AVATAR_URL =
  "https://i.pinimg.com/originals/c9/31/92/c93192b782081d4d1d70b03a3c1cf011.jpg";

export const DEFAULT_USER_BACKGROUND_URL =
  "https://krisp.ai/blog/wp-content/uploads/2024/07/background-meme1.jpg";
