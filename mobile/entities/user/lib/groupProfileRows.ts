export type ProfileRow = {
  id: string;
  label: string;
  value: string;
  href?: string;
};

export type ProfileRowSection = {
  id: string;
  title: string | null;
  rows: ProfileRow[];
};

const PROFILE_ROW_SECTIONS: Array<{
  id: string;
  title: string | null;
  rowIds: string[];
}> = [
  {
    id: "stats",
    title: "Основное",
    rowIds: [
      "followersCount",
      "followingCount",
      "totalSalesCount",
      "totalSalesAmount",
      "totalPurchasesAmount",
      "userRatingByVotes",
      "userLoyaltyPoints",
    ],
  },
  {
    id: "identity",
    title: "Контакты",
    rowIds: ["userName", "email", "userPhoneNumber", "userAddress"],
  },
  {
    id: "social",
    title: "Соцсети",
    rowIds: [
      "socialTelegramUrl",
      "socialInstagramUrl",
      "socialVkUrl",
      "socialYoutubeUrl",
      "socialWhatsappUrl",
      "socialWebsiteUrl",
    ],
  },
  {
    id: "personal",
    title: "Личные данные",
    rowIds: ["userBirthDate", "userGender"],
  },
  {
    id: "account",
    title: "Аккаунт",
    rowIds: ["isUserDataConfirmed", "isPremiumUser", "notificationsEnabled", "createdAt"],
  },
  {
    id: "other",
    title: null,
    rowIds: ["notesAboutUser", "userRole"],
  },
];

const BOOLEAN_ROW_IDS = new Set([
  "isUserDataConfirmed",
  "isPremiumUser",
  "notificationsEnabled",
]);

export const groupProfileRows = (rows: ProfileRow[]): ProfileRowSection[] => {
  const rowById = new Map(rows.map((row) => [row.id, row]));

  return PROFILE_ROW_SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    rows: section.rowIds
      .map((rowId) => rowById.get(rowId))
      .filter((row): row is ProfileRow => row != null),
  })).filter((section) => section.rows.length > 0);
};

export const isBooleanProfileRow = (rowId: string): boolean => BOOLEAN_ROW_IDS.has(rowId);
