import {
  USER_SOCIAL_LINK_FIELDS,
  formatSocialLinkDisplay,
  formatUserBusinessHoursForProfile,
} from "@molha/api-contract";
import {
  COMMON_UI,
  FORMAT_BOOLEAN_RU,
  USER_PROFILE_COPY,
  formatUserProfileRatingVotesLabel,
  formatUserProfileRatingValue,
} from "../../../shared/config/appUiCopy.js";
import {
  USER_GENDER_LABEL_RU,
  USER_ROLE_ADMIN,
  USER_ROLE_LABEL_RU,
  USER_ROLE_USER,
} from "../model/userConstants.js";
import { formatUserBackgroundForDisplay } from "./userBackgroundValue.js";
import { formatSearchRowTotalSalesCount } from "./formatSearchRowTotalSalesCount.js";
import { formatSearchRowTotalSales } from "./formatSearchRowTotalSales.js";
import { isPremiumActive } from "./isPremiumActive.js";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "./ruPhone.js";

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

const L = USER_PROFILE_COPY.LABELS;

/** Не показывать в `dl` профиля — медиа уже в шапке модалки. */
const HIDDEN_MEDIA_URL_ROW_IDS = new Set(["userAvatarUrl", "userBackgroundUrl"]);

const INTERNAL_ROW_IDS = new Set(["notesAboutUser"]);

/**
 * @param {import('../model/types.js').UserPublicProfile} user
 * @param {{ showAdminRole?: boolean; hideMediaUrls?: boolean }} [options]
 * @returns {{ id: string, label: string, value: string, href?: string }[]}
 */
export function getUserProfileRows(user, options = {}) {
  const { showAdminRole = false, hideMediaUrls = true } = options;
  const rating = user.userRatingByVotes;
  const businessHoursValue = formatUserBusinessHoursForProfile(user);

  const rows = [
    { id: "userName", label: L.userName, value: dashIfEmpty(user.userName) },
    ...(typeof user.userFullName === "string" && user.userFullName.trim() !== ""
      ? [
          {
            id: "userFullName",
            label: L.userFullName,
            value: user.userFullName.trim(),
          },
        ]
      : []),
    {
      id: "followersCount",
      label: L.followersCount,
      value:
        user.followersCount == null
          ? COMMON_UI.EM_DASH
          : String(Math.max(0, user.followersCount)),
    },
    {
      id: "followingCount",
      label: L.followingCount,
      value:
        user.followingCount == null
          ? COMMON_UI.EM_DASH
          : String(Math.max(0, user.followingCount)),
    },
    ...(businessHoursValue != null
      ? [
          {
            id: "userBusinessHours",
            label: L.userBusinessHours,
            value: businessHoursValue,
          },
        ]
      : []),
    {
      id: "totalSalesCount",
      label: L.totalSalesCount,
      value: formatSearchRowTotalSalesCount(user.totalSalesCount),
    },
    {
      id: "totalSalesAmount",
      label: L.totalSalesAmount,
      value: formatSearchRowTotalSales(user.totalSalesAmount),
    },
    {
      id: "totalPurchasesAmount",
      label: L.totalPurchasesAmount,
      value: formatSearchRowTotalSales(user.totalPurchasesAmount),
    },
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
      value: dashIfEmpty(
        [user.userAddress, user.userAddressFlat ? `кв. ${user.userAddressFlat}` : ""]
          .filter(Boolean)
          .join(", "),
      ),
    },
    {
      id: "userPhoneNumber",
      label: L.userPhoneNumber,
      value: formatRuPhoneDisplayOrEmpty(user.userPhoneNumber),
      href: toRuPhoneTelHref(user.userPhoneNumber) ?? undefined,
      needsPhoneReveal: Boolean(user.hasPhoneNumber) && isEmpty(user.userPhoneNumber),
    },
    {
      id: "isUserDataConfirmed",
      label: L.isUserDataConfirmed,
      value: formatBooleanRu(user.isUserDataConfirmed === true),
    },
    {
      id: "userBackgroundUrl",
      label: L.userBackgroundUrl,
      value: formatUserBackgroundForDisplay(user.userBackgroundUrl),
    },
    { id: "userRole", label: L.userRole, value: formatRole(user.userRole) },
    {
      id: "notificationsEnabled",
      label: L.notificationsEnabled,
      value: formatBooleanRu(user.notificationsEnabled),
    },
    {
      id: "isPremiumUser",
      label: L.isPremiumUser,
      value: formatBooleanRu(isPremiumActive(user)),
    },
    {
      id: "notesAboutUser",
      label: L.notesAboutUser,
      value: dashIfEmpty(user.notesAboutUser),
    },
    ...USER_SOCIAL_LINK_FIELDS.flatMap((field) => {
      const raw = user[field.id];
      if (typeof raw !== "string" || raw.trim() === "") {
        return [];
      }
      const href = raw.trim();
      return [
        {
          id: field.id,
          label: L[field.id] ?? field.labelRu,
          value: formatSocialLinkDisplay(href),
          href,
        },
      ];
    }),
    {
      id: "userLoyaltyPoints",
      label: L.userLoyaltyPoints,
      value:
        user.userLoyaltyPoints == null
          ? COMMON_UI.EM_DASH
          : String(user.userLoyaltyPoints),
    },
    {
      id: "userRatingByVotes",
      label: formatUserProfileRatingVotesLabel(rating),
      value: formatUserProfileRatingValue(rating),
    },
    { id: "createdAt", label: L.createdAt, value: formatIso(user.createdAt) },
  ];

  return rows.filter((row) => {
    if (hideMediaUrls && HIDDEN_MEDIA_URL_ROW_IDS.has(row.id)) {
      return false;
    }

    if (INTERNAL_ROW_IDS.has(row.id) && user[row.id] === undefined) {
      return false;
    }

    if (row.id !== "userRole") {
      return true;
    }

    const role = user.userRole;
    if (!role || role === USER_ROLE_USER) {
      return false;
    }
    return showAdminRole && role === USER_ROLE_ADMIN;
  });
}
