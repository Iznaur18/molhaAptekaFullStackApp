import {
  COMMON_UI,
  FORMAT_BOOLEAN_RU,
  USER_PROFILE_COPY,
  formatUserProfileRatingLine,
} from "../../../shared/config/appUiCopy.js";
import {
  USER_GENDER_LABEL_RU,
  USER_ROLE_LABEL_RU,
} from "../model/userConstants.js";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(
  COMMON_UI.LOCALE_RU,
  USER_PROFILE_COPY.DATE_FORMAT_OPTIONS,
);

function isEmpty(value) {
  return value === undefined || value === null || value === "";
}

function dashIfEmpty(value) {
  return isEmpty(value) ? COMMON_UI.EM_DASH : value;
}

function formatIso(value) {
  if (isEmpty(value)) return COMMON_UI.EM_DASH;
  try {
    return DATE_TIME_FORMAT.format(new Date(value));
  } catch {
    return String(value);
  }
}

function formatBooleanRu(value) {
  if (value === undefined || value === null) return COMMON_UI.EM_DASH;
  return value ? FORMAT_BOOLEAN_RU.YES : FORMAT_BOOLEAN_RU.NO;
}

function formatGender(value) {
  if (isEmpty(value)) return COMMON_UI.EM_DASH;
  return USER_GENDER_LABEL_RU[value] ?? String(value);
}

function formatRole(value) {
  if (isEmpty(value)) return COMMON_UI.EM_DASH;
  return USER_ROLE_LABEL_RU[value] ?? String(value);
}

function formatBuyList(value) {
  if (!Array.isArray(value) || value.length === 0) return COMMON_UI.EM_DASH;
  return value.join(", ");
}

function formatRating(value) {
  if (!value || typeof value !== "object") return COMMON_UI.EM_DASH;
  const { countVotes = 0, totalRating = 0 } = value;
  if (countVotes === 0) return USER_PROFILE_COPY.RATING_NONE;
  const avg = totalRating / countVotes;
  return formatUserProfileRatingLine(avg, countVotes, totalRating);
}

function formatUrl(value) {
  if (isEmpty(value)) return COMMON_UI.EM_DASH;
  return value;
}

const L = USER_PROFILE_COPY.LABELS;

/**
 * @param {import('../model/types.js').UserPublicProfile} user
 * @returns {{ id: string, label: string, value: string }[]}
 */
export function getUserProfileRows(user) {
  const rating = user.userRatingByVotes;

  return [
    { id: "_id", label: L._id, value: dashIfEmpty(user._id) },
    { id: "userName", label: L.userName, value: dashIfEmpty(user.userName) },
    { id: "email", label: L.email, value: dashIfEmpty(user.email) },
    {
      id: "userBirthDate",
      label: L.userBirthDate,
      value: formatIso(user.userBirthDate),
    },
    {
      id: "userGender",
      label: L.userGender,
      value: formatGender(user.userGender),
    },
    {
      id: "userAddress",
      label: L.userAddress,
      value: dashIfEmpty(user.userAddress),
    },
    {
      id: "userPhoneNumber",
      label: L.userPhoneNumber,
      value: dashIfEmpty(user.userPhoneNumber),
    },
    {
      id: "userLastLoginAt",
      label: L.userLastLoginAt,
      value: formatIso(user.userLastLoginAt),
    },
    {
      id: "userAvatarUrl",
      label: L.userAvatarUrl,
      value: formatUrl(user.userAvatarUrl),
    },
    {
      id: "userBackgroundUrl",
      label: L.userBackgroundUrl,
      value: formatUrl(user.userBackgroundUrl),
    },
    {
      id: "isActiveUser",
      label: L.isActiveUser,
      value: formatBooleanRu(user.isActiveUser),
    },
    {
      id: "isBlockedUser",
      label: L.isBlockedUser,
      value: formatBooleanRu(user.isBlockedUser),
    },
    { id: "userRole", label: L.userRole, value: formatRole(user.userRole) },
    {
      id: "userDiscountPercent",
      label: L.userDiscountPercent,
      value:
        user.userDiscountPercent == null
          ? COMMON_UI.EM_DASH
          : String(user.userDiscountPercent),
    },
    {
      id: "notificationsEnabled",
      label: L.notificationsEnabled,
      value: formatBooleanRu(user.notificationsEnabled),
    },
    {
      id: "isPremiumUser",
      label: L.isPremiumUser,
      value: formatBooleanRu(user.isPremiumUser),
    },
    {
      id: "notesAboutUser",
      label: L.notesAboutUser,
      value: dashIfEmpty(user.notesAboutUser),
    },
    {
      id: "userLoyaltyPoints",
      label: L.userLoyaltyPoints,
      value:
        user.userLoyaltyPoints == null
          ? COMMON_UI.EM_DASH
          : String(user.userLoyaltyPoints),
    },
    { id: "buyList", label: L.buyList, value: formatBuyList(user.buyList) },
    {
      id: "userRatingByVotes",
      label: L.userRatingByVotes,
      value: formatRating(rating),
    },
    {
      id: "telegramUserId",
      label: L.telegramUserId,
      value: dashIfEmpty(user.telegramUserId),
    },
    {
      id: "telegramUsername",
      label: L.telegramUsername,
      value: dashIfEmpty(user.telegramUsername),
    },
    {
      id: "telegramPhotoUrl",
      label: L.telegramPhotoUrl,
      value: formatUrl(user.telegramPhotoUrl),
    },
    { id: "createdAt", label: L.createdAt, value: formatIso(user.createdAt) },
    { id: "updatedAt", label: L.updatedAt, value: formatIso(user.updatedAt) },
  ];
}
