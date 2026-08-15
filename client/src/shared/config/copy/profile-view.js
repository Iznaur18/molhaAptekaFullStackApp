// Автосгенерировано из appUiCopy.js: домен «profile-view».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

/** Сторисы пользователей на главной */
export const USER_STORY_UI = {
  SECTION_TITLE: "История",
  ADD_LABEL: "Ваша история",
  LOADING: "Загрузка…",
  MEDIA_LOADING: "Загружаем медиа…",
  MEDIA_LOAD_ERROR: "Не удалось загрузить фото или видео",
  CREATE_TITLE: "Новый сторис",
  CAPTION_LABEL: "Текст (необязательно)",
  CAPTION_PLACEHOLDER: "До 150 символов…",
  PICK_PHOTO: "Фото",
  PICK_VIDEO: "Видео",
  PUBLISH: "Опубликовать",
  PUBLISHING: "Публикуем…",
  DELETE: "Удалить",
  DELETING: "Удаляем…",
  REPORT: "Пожаловаться",
  CLOSE: "Закрыть",
  ERROR_GENERIC: "Не удалось выполнить действие",
  ERROR_VIDEO_TYPE: "Видео: только MP4 или WebM",
  ERROR_VIDEO_SIZE: "Видео: не больше 100 МБ",
  ERROR_VIDEO_ASPECT: "Видео: только вертикальный формат 9:16",
  ERROR_VIDEO_READ: "Не удалось прочитать видео",
  VIDEO_DURATION_HINT:
    "Максимум 30 секунд: более длинный ролик автоматически обрежется при загрузке. Исходный файл — до 100 МБ.",
  ERROR_IMAGE: "Не удалось обработать фото",
  ERROR_CAPTION: "Текст: не больше 150 символов",
  ERROR_MEDIA_REQUIRED: "Выберите фото или видео",
  STORY_REPORT_TITLE: "Жалоба на сторис",
  STORY_REPORT_SUBMIT: "Отправить жалобу",
  STORY_REPORT_PENDING: "Отправляем…",
  STORY_REPORT_TEXT_LABEL: "Опишите проблему",
  STORY_REPORT_TEXT_PLACEHOLDER: "Текст жалобы…",
  STORY_REPORTS_COUNT_LABEL: (count) => `Жалоб: ${count}`,
  STORY_REPORTS_OPEN_AUTHOR: "Автор",
  STORY_REPORTS_ACTION_DISMISS: "Отклонить жалобы",
  STORY_REPORTS_ACTION_HIDE: "Скрыть сторис",
  STORY_REPORTS_STAFF_NOTE_LABEL: "Комментарий staff",
  STORY_REPORTS_STAFF_NOTE_PLACEHOLDER: "Обязательный комментарий…",
  STORY_REPORTS_ACTION_PENDING: "Сохраняем…",
  PREV_STORY: "Предыдущий",
  NEXT_STORY: "Следующий",
};

export const USER_FOLLOW_BUTTON_UI = {
  FOLLOW: "Подписаться",
  UNFOLLOW: "Отписаться",
  LOADING: "…",
  ERROR: "Не удалось изменить подписку",
};

/** Оценка пользователя `POST /vote/:targetUserId` */
export const USER_VOTE_RATING_UI = {
  COLLAPSE_SUMMARY: "Оценить пользователя",
  TITLE: "Оценка",
  CURRENT_AGGREGATE: "Сейчас в профиле",
  RANGE_LABEL: "Ваша оценка",
  SUBMIT: "Отправить оценку",
  SUBMIT_LOADING: "Отправка…",
  ALREADY_RATED: "Вы уже оценили пользователя",
  LOGIN_HINT: "Войдите, чтобы поставить оценку.",
  LOGIN_BUTTON: "Войти",
  SELF_HINT: "Нельзя оценить свой профиль.",
  ME_LOADING: "Загрузка…",
  MY_VOTE_RESOLVING: "Проверяем вашу оценку…",
  SUCCESS: "Оценка сохранена",
  SUCCESS_FLASH_MS: 2800,
};

/** Модалка карточки пользователя (продавец / общий шаблон) */
export const USER_DETAILS_MODAL_UI = {
  TITLE_LOADING: "Профиль: загрузка…",
  TITLE_FALLBACK: "Профиль пользователя",
  LOADING_BODY: "Загрузка данных…",
  CLOSE_TEXT: "Закрыть",
  ARIA_CLOSE: "Закрыть",
};

/** Страница чужого профиля (`/user/:id`) — паритет с mobile */
export const USER_DETAILS_PAGE_UI = {
  TITLE: "Профиль",
  BACK_ARIA: "Назад",
  LOADING: "Загрузка профиля…",
  FETCH_FALLBACK: "Не удалось загрузить профиль",
  SELF_REDIRECT_HINT: "Это ваш профиль",
  OPEN_OVERVIEW: "Мой обзор",
  RETRY: "Повторить",
};

/** Блок покупок в чужом профиле (авторизованный зритель). */
export const USER_PROFILE_PURCHASES_UI = {
  HEADING: "Список покупок",
  LOADING: "Загрузка покупок…",
  EMPTY: "Покупок нет",
  UNAVAILABLE: "Товар недоступен или удален",
};

/** Блок товаров продавца в чужом профиле (авторизованный зритель). */
export const USER_PROFILE_PRODUCTS_UI = {
  HEADING: "Список товаров",
  LOADING: "Загрузка товаров…",
  EMPTY: "Товаров нет",
  SHOW_MORE: "Показать ещё",
  SHOW_LESS: "Показать меньше",
  LOADING_MORE: "Загрузка…",
  UNAVAILABLE: "Товар недоступен или удален",
};
