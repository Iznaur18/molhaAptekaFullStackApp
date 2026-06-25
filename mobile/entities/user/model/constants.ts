export const USER_NAME_MIN_LENGTH = 3;
export const USER_NAME_MAX_LENGTH = 30;
export const USER_NAME_PATTERN = /^[a-z0-9]+$/;

export const RU_PHONE_MAX_DIGITS = 11;
export const RU_PHONE_E164_REGEX = /^\+79\d{9}$/;

export const USER_ROLE_USER = "user";
export const USER_ROLE_ADMIN = "admin";

export const USER_GENDER_MALE = "male";
export const USER_GENDER_FEMALE = "female";
export const USER_GENDER_NO_SELECTED = "noSelected";

export const USER_GENDER_LABEL_RU: Record<string, string> = {
  male: "Мужской",
  female: "Женский",
  noSelected: "Не указан",
};

export const ADDRESS_CITY_MAX_LENGTH = 80;
export const ADDRESS_DISTRICT_MAX_LENGTH = 80;
export const ADDRESS_STREET_MAX_LENGTH = 80;
export const ADDRESS_HOUSE_MAX_LENGTH = 20;
export const ADDRESS_FLAT_MAX_LENGTH = 20;

export const USER_ROLE_LABEL_RU: Record<string, string> = {
  user: "Пользователь",
  admin: "Администратор",
  moderator: "Модератор",
};

export const NOTES_ABOUT_USER_MAX_CHARS = 500;

export const DEFAULT_USER_AVATAR_URL =
  "https://i.pinimg.com/originals/c9/31/92/c93192b782081d4d1d70b03a3c1cf011.jpg";

export const USER_PROFILE_PRODUCTS_PAGE_SIZE = 5;
export const USER_PROFILE_PRODUCTS_API_LIMIT_MAX = 20;
