/** Id строк профиля — паритет web `profileRowIds.js` (rowActions / stats). */
export const PROFILE_ROW_ID = {
  PHONE: "userPhoneNumber",
  FOLLOWERS: "followersCount",
  FOLLOWING: "followingCount",
  TOTAL_SALES_COUNT: "totalSalesCount",
  TOTAL_SALES_AMOUNT: "totalSalesAmount",
  TOTAL_PURCHASES_AMOUNT: "totalPurchasesAmount",
  RATING: "userRatingByVotes",
  BUSINESS_HOURS: "userBusinessHours",
  LOYALTY_POINTS: "userLoyaltyPoints",
  WISHLIST: "wishlistCount",
} as const;

export type ProfileRowId = (typeof PROFILE_ROW_ID)[keyof typeof PROFILE_ROW_ID];
