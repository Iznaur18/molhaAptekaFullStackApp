import {
  USER_GENDER_LABEL_RU,
  USER_ROLE_LABEL_RU,
} from '../model/userConstants.js';

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function dashIfEmpty(value) {
  return isEmpty(value) ? '—' : value;
}

function formatIso(value) {
  if (isEmpty(value)) return '—';
  try {
    return DATE_TIME_FORMAT.format(new Date(value));
  } catch {
    return String(value);
  }
}

function formatBooleanRu(value) {
  if (value === undefined || value === null) return '—';
  return value ? 'Да' : 'Нет';
}

function formatGender(value) {
  if (isEmpty(value)) return '—';
  return USER_GENDER_LABEL_RU[value] ?? String(value);
}

function formatRole(value) {
  if (isEmpty(value)) return '—';
  return USER_ROLE_LABEL_RU[value] ?? String(value);
}

function formatBuyList(value) {
  if (!Array.isArray(value) || value.length === 0) return '—';
  return value.join(', ');
}

function formatRating(value) {
  if (!value || typeof value !== 'object') return '—';
  const { countVotes = 0, totalRating = 0 } = value;
  if (countVotes === 0) return 'Нет оценок';
  const avg = totalRating / countVotes;
  return `среднее ${avg.toFixed(1)} · голосов ${countVotes} · сумма ${totalRating}`;
}

function formatUrl(value) {
  if (isEmpty(value)) return '—';
  return value;
}

/**
 * @param {import('../model/types.js').UserPublicProfile} user
 * @returns {{ id: string, label: string, value: string }[]}
 */
export function getUserProfileRows(user) {
  const rating = user.userRatingByVotes;

  return [
    { id: '_id', label: 'ID', value: dashIfEmpty(user._id) },
    { id: 'userName', label: 'Никнейм', value: dashIfEmpty(user.userName) },
    { id: 'email', label: 'Email', value: dashIfEmpty(user.email) },
    { id: 'userBirthDate', label: 'Дата рождения', value: formatIso(user.userBirthDate) },
    { id: 'userGender', label: 'Пол', value: formatGender(user.userGender) },
    { id: 'userAddress', label: 'Адрес', value: dashIfEmpty(user.userAddress) },
    { id: 'userPhoneNumber', label: 'Телефон', value: dashIfEmpty(user.userPhoneNumber) },
    { id: 'userLastLoginAt', label: 'Последний вход', value: formatIso(user.userLastLoginAt) },
    { id: 'userAvatarUrl', label: 'URL аватара', value: formatUrl(user.userAvatarUrl) },
    {
      id: 'userBackgroundUrl',
      label: 'URL фона',
      value: formatUrl(user.userBackgroundUrl),
    },
    { id: 'isActiveUser', label: 'Активен', value: formatBooleanRu(user.isActiveUser) },
    { id: 'isBlockedUser', label: 'Заблокирован', value: formatBooleanRu(user.isBlockedUser) },
    { id: 'userRole', label: 'Роль', value: formatRole(user.userRole) },
    {
      id: 'userDiscountPercent',
      label: 'Скидка, %',
      value: user.userDiscountPercent == null ? '—' : String(user.userDiscountPercent),
    },
    {
      id: 'notificationsEnabled',
      label: 'Уведомления',
      value: formatBooleanRu(user.notificationsEnabled),
    },
    { id: 'isPremiumUser', label: 'Премиум', value: formatBooleanRu(user.isPremiumUser) },
    { id: 'notesAboutUser', label: 'Заметки', value: dashIfEmpty(user.notesAboutUser) },
    {
      id: 'userLoyaltyPoints',
      label: 'Баллы лояльности',
      value: user.userLoyaltyPoints == null ? '—' : String(user.userLoyaltyPoints),
    },
    { id: 'buyList', label: 'Список покупок (id)', value: formatBuyList(user.buyList) },
    { id: 'userRatingByVotes', label: 'Рейтинг по голосам', value: formatRating(rating) },
    { id: 'telegramUserId', label: 'Telegram user id', value: dashIfEmpty(user.telegramUserId) },
    {
      id: 'telegramUsername',
      label: 'Telegram username',
      value: dashIfEmpty(user.telegramUsername),
    },
    {
      id: 'telegramPhotoUrl',
      label: 'Telegram photo URL',
      value: formatUrl(user.telegramPhotoUrl),
    },
    { id: 'createdAt', label: 'Создан', value: formatIso(user.createdAt) },
    { id: 'updatedAt', label: 'Обновлён', value: formatIso(user.updatedAt) },
  ];
}
