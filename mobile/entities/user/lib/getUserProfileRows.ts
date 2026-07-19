import {
  USER_SOCIAL_LINK_FIELDS,
  formatSocialLinkDisplay,
} from "@molha/api-contract";
import {
  formatSearchRowTotalSales,
  formatSearchRowTotalSalesCount,
} from "@/entities/user/lib/formatSearchRowTotalSales";
import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "@/entities/user/lib/ruPhone";
import {
  USER_GENDER_LABEL_RU,
  USER_ROLE_ADMIN,
  USER_ROLE_LABEL_RU,
  USER_ROLE_USER,
} from "@/entities/user/model/constants";
import { USER_PROFILE_COPY } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";

export type ProfileRow = {
  id: string;
  label: string;
  value: string;
  href?: string;
};

const EM_DASH = "—";

const dashIfEmpty = (value: unknown): string => {
  if (value === undefined || value === null || value === "") {
    return EM_DASH;
  }
  return String(value);
};

const formatBooleanRu = (value: unknown): string => {
  if (value === undefined || value === null) {
    return EM_DASH;
  }
  return value ? USER_PROFILE_COPY.YES : USER_PROFILE_COPY.NO;
};

const formatGender = (value: unknown): string => {
  if (value === undefined || value === null || value === "") {
    return EM_DASH;
  }
  const key = String(value);
  return USER_GENDER_LABEL_RU[key] ?? key;
};

const formatRole = (value: unknown): string => {
  if (value === undefined || value === null || value === "") {
    return EM_DASH;
  }
  const key = String(value);
  return USER_ROLE_LABEL_RU[key] ?? key;
};

const formatUserProfileRatingValue = (
  raw: { countVotes?: number; totalRating?: number } | null | undefined,
): string => {
  if (!raw || typeof raw !== "object") {
    return "0";
  }

  const countVotes = Number(raw.countVotes) || 0;
  const totalRating = Number(raw.totalRating) || 0;
  if (countVotes === 0) {
    return "0";
  }

  const avg = totalRating / countVotes;
  return String(Math.round(avg * 10) / 10);
};

const formatUserProfileRatingVotesLabel = (
  raw: { countVotes?: number } | null | undefined,
): string => {
  const countVotes = Number(raw?.countVotes) || 0;
  return `${USER_PROFILE_COPY.RATING_VOTES_PREFIX} ${countVotes}`;
};

const HIDDEN_MEDIA_URL_ROW_IDS = new Set(["userAvatarUrl", "userBackgroundUrl"]);

export const getUserProfileRows = (
  user: Record<string, unknown>,
  options: { showAdminRole?: boolean; hideMediaUrls?: boolean } = {},
): ProfileRow[] => {
  const { showAdminRole = false, hideMediaUrls = true } = options;
  const rating = user.userRatingByVotes as
    | { countVotes?: number; totalRating?: number }
    | null
    | undefined;

  const socialRows: ProfileRow[] = USER_SOCIAL_LINK_FIELDS.flatMap((field) => {
    const raw = user[field.id];
    if (typeof raw !== "string" || raw.trim() === "") {
      return [];
    }
    const href = raw.trim();
    const label =
      USER_PROFILE_COPY.LABELS[field.id as keyof typeof USER_PROFILE_COPY.LABELS] ??
      field.labelRu;
    return [
      {
        id: field.id,
        label,
        value: formatSocialLinkDisplay(href),
        href,
      },
    ];
  });

  const rows: ProfileRow[] = [
    { id: "userName", label: USER_PROFILE_COPY.LABELS.userName, value: dashIfEmpty(user.userName) },
    {
      id: "followersCount",
      label: USER_PROFILE_COPY.LABELS.followersCount,
      value:
        user.followersCount == null
          ? EM_DASH
          : String(Math.max(0, Number(user.followersCount) || 0)),
    },
    {
      id: "followingCount",
      label: USER_PROFILE_COPY.LABELS.followingCount,
      value:
        user.followingCount == null
          ? EM_DASH
          : String(Math.max(0, Number(user.followingCount) || 0)),
    },
    {
      id: "totalSalesCount",
      label: USER_PROFILE_COPY.LABELS.totalSalesCount,
      value: formatSearchRowTotalSalesCount(user.totalSalesCount),
    },
    {
      id: "totalSalesAmount",
      label: USER_PROFILE_COPY.LABELS.totalSalesAmount,
      value: formatSearchRowTotalSales(user.totalSalesAmount),
    },
    {
      id: "totalPurchasesAmount",
      label: USER_PROFILE_COPY.LABELS.totalPurchasesAmount,
      value: formatSearchRowTotalSales(user.totalPurchasesAmount),
    },
    { id: "email", label: USER_PROFILE_COPY.LABELS.email, value: dashIfEmpty(user.email) },
    {
      id: "userBirthDate",
      label: USER_PROFILE_COPY.LABELS.userBirthDate,
      value: user.userBirthDate ? formatIsoDateTime(String(user.userBirthDate)) : EM_DASH,
    },
    {
      id: "userGender",
      label: USER_PROFILE_COPY.LABELS.userGender,
      value: formatGender(user.userGender),
    },
    {
      id: "userAddress",
      label: USER_PROFILE_COPY.LABELS.userAddress,
      value: dashIfEmpty(
        [user.userAddress, user.userAddressFlat ? `кв. ${user.userAddressFlat}` : ""]
          .filter(Boolean)
          .join(", "),
      ),
    },
    {
      id: "userPhoneNumber",
      label: USER_PROFILE_COPY.LABELS.userPhoneNumber,
      value: formatRuPhoneDisplayOrEmpty(user.userPhoneNumber),
      href: toRuPhoneTelHref(user.userPhoneNumber) ?? undefined,
    },
    ...socialRows,
    {
      id: "isUserDataConfirmed",
      label: USER_PROFILE_COPY.LABELS.isUserDataConfirmed,
      value: formatBooleanRu(user.isUserDataConfirmed === true),
    },
    {
      id: "userRole",
      label: USER_PROFILE_COPY.LABELS.userRole,
      value: formatRole(user.userRole),
    },
    {
      id: "notificationsEnabled",
      label: USER_PROFILE_COPY.LABELS.notificationsEnabled,
      value: formatBooleanRu(user.notificationsEnabled),
    },
    {
      id: "isPremiumUser",
      label: USER_PROFILE_COPY.LABELS.isPremiumUser,
      value: formatBooleanRu(isPremiumActive(user)),
    },
    {
      id: "notesAboutUser",
      label: USER_PROFILE_COPY.LABELS.notesAboutUser,
      value: dashIfEmpty(user.notesAboutUser),
    },
    {
      id: "userLoyaltyPoints",
      label: USER_PROFILE_COPY.LABELS.userLoyaltyPoints,
      value:
        user.userLoyaltyPoints == null ? EM_DASH : String(user.userLoyaltyPoints),
    },
    {
      id: "userRatingByVotes",
      label: formatUserProfileRatingVotesLabel(rating),
      value: formatUserProfileRatingValue(rating),
    },
    {
      id: "createdAt",
      label: USER_PROFILE_COPY.LABELS.createdAt,
      value: user.createdAt ? formatIsoDateTime(String(user.createdAt)) : EM_DASH,
    },
  ];

  return rows.filter((row) => {
    if (hideMediaUrls && HIDDEN_MEDIA_URL_ROW_IDS.has(row.id)) {
      return false;
    }

    if (row.id === "notesAboutUser" && user.notesAboutUser === undefined) {
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
};
