/** @typedef {{ id: string; label: string; value: string; href?: string }} ProfileRow */

/** @typedef {{ id: string; title: string | null; rows: ProfileRow[] }} ProfileRowSection */

const PROFILE_ROW_SECTIONS = [
  {
    id: "stats",
    title: "Статистика",
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
    id: "personal",
    title: "Личные данные",
    rowIds: ["userBirthDate", "userGender"],
  },
  {
    id: "account",
    title: "Аккаунт",
    rowIds: [
      "isUserDataConfirmed",
      "isPremiumUser",
      "notificationsEnabled",
      "createdAt",
    ],
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

/**
 * @param {ProfileRow[]} rows
 * @returns {ProfileRowSection[]}
 */
export function groupProfileRows(rows) {
  const rowById = new Map(rows.map((row) => [row.id, row]));

  return PROFILE_ROW_SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    rows: section.rowIds
      .map((rowId) => rowById.get(rowId))
      .filter((row) => row != null),
  })).filter((section) => section.rows.length > 0);
}

/**
 * @param {string} rowId
 * @returns {boolean}
 */
export function isBooleanProfileRow(rowId) {
  return BOOLEAN_ROW_IDS.has(rowId);
}
