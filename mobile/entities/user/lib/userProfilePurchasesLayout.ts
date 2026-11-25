/**
 * Паритет web `UserProfilePurchasesList.css`
 * `--user-profile-purchases-*` / `.user-profile-purchases { padding: 0.75rem 0.875rem }`.
 */
export const USER_PROFILE_PURCHASES_LAYOUT = {
  sectionRadius: 24,
  thumbSize: 64,
  thumbRadius: 14,
  tileGap: 10,
  /** `padding: 0.75rem` */
  bodyPaddingY: 12,
  /** `padding: … 0.875rem` */
  bodyPaddingX: 14,
  /** heading `padding: 0.5rem 0.875rem` */
  headingPaddingY: 8,
  headingPaddingX: 14,
  thumbBorderWidth: 1,
} as const;

/** Высота трека = только thumb (pad даёт body). */
export const USER_PROFILE_PURCHASES_TRACK_HEIGHT =
  USER_PROFILE_PURCHASES_LAYOUT.thumbSize;
