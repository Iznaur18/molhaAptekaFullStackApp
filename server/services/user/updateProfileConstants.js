export const EMPTY_PROFILE_UPDATE_MESSAGE =
  "Нет данных для обновления. Укажите хотя бы одно разрешенное поле";

export const PASSWORD_CHANGE_VIA_AUTH_MESSAGE =
  "Смена пароля выполняется через /auth/password/change";

export const PASSWORD_LIKE_PROFILE_FIELDS = Object.freeze([
  "password",
  "passwordHash",
  "currentPassword",
  "newPassword",
  "newPasswordConfirm",
]);

export const INVALID_EDITOR_TOKEN_MESSAGE =
  "Текущий пользователь не найден. Токен недействителен";

export const PROFILE_UPDATE_FORBIDDEN_MESSAGE =
  "У вас нет прав на обновление этого профиля";

export const PROFILE_DELETE_FORBIDDEN_MESSAGE =
  "У вас нет прав на удаление этого профиля";

export const PROFILE_DELETE_TARGET_NOT_FOUND_MESSAGE =
  "Пользователь для удаления не найден";

export const PROFILE_DELETE_ALREADY_REMOVED_MESSAGE =
  "Пользователь не найден или уже был удален";

export const PROFILE_DELETE_CASCADE_ERROR_MESSAGE =
  "Ошибка при удалении товаров пользователя";
