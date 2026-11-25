/** Паритет web `client/src/shared/ui/icon/iconSizes.js`. */
export const izIconSizes = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;

export type IzIconSize = keyof typeof izIconSizes;

/** Tab bar / primary nav stroke (lucide). */
export const izIconStrokeNav = 2.25;
