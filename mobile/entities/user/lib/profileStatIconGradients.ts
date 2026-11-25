/** Паритет web `UserProfileInfoPanel.css` `.user-profile-info__stat-icon` gradients. */
export const PROFILE_STAT_ICON_GRADIENTS: Record<string, [string, string]> = {
  followersCount: ["#6b9bff", "#3b6fd9"],
  followingCount: ["#9b7bff", "#6b4fd9"],
  totalSalesCount: ["#ff7a8a", "#e8455a"],
  totalSalesAmount: ["#ffb35a", "#f08a24"],
  totalPurchasesAmount: ["#4fd9b0", "#1fad86"],
  userBusinessHours: ["#7eb6ff", "#4a86d9"],
  userRatingByVotes: ["#c4a8ff", "#8b6fd9"],
  userLoyaltyPoints: ["#5ee0c8", "#2bb89a"],
};

export const PROFILE_STAT_ICON_GRADIENT_DEFAULT: [string, string] = [
  "#6b8cff",
  "#3b6fd9",
];

export const resolveProfileStatIconGradient = (
  rowId: string,
): [string, string] =>
  PROFILE_STAT_ICON_GRADIENTS[rowId] ?? PROFILE_STAT_ICON_GRADIENT_DEFAULT;

/** web: часы работы + баллы на всю ширину сетки. */
export const PROFILE_STATS_WIDE_ROW_IDS = new Set([
  "userBusinessHours",
  "userLoyaltyPoints",
]);

export const PROFILE_STATS_SECTION_ID = "stats";
