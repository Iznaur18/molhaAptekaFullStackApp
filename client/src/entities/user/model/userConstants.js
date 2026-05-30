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

/** Как `ADDRESS_LINE_MAX_LENGTH` в `server/constants/dadataConstants.js`. */
export { ADDRESS_LINE_MAX_LENGTH as USER_ADDRESS_MAX_CHARS } from "../../address/model/constants.js";

/** Как `NOTES_ABOUT_USER_MAX_CHARS` в `server/utils/maxWordsText.js`. */
export const NOTES_ABOUT_USER_MAX_CHARS = 500;

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

export { DEFAULT_USER_BACKGROUND_PRESET_ID } from "./userBackgroundPresets.js";
