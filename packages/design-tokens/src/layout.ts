/**
 * Screen layout ladder — паритет web AppShell / mobile screenBreakpoints.
 * Phone gutter канон: 8px (= 0.5rem).
 */
export const izLayout = {
  /** `--app-shell-content-inline-padding` phone / SCREEN_CONTENT_PADDING_HORIZONTAL */
  contentPaddingHorizontalPhone: 8,
  contentPaddingHorizontalCompact: 12,
  contentPaddingHorizontalWide: 16,
  contentInlinePaddingPhoneMaxWidth: 640,
  contentInlinePaddingCompactMaxWidth: 667,

  /** Отступ между секциями home/catalog (`--iz-space-2`) */
  contentSectionGap: 8,

  /** Extra gap над floating bottom nav */
  tabBarExtraGap: 16,

  /** `--app-shell-max-width` ladder (px) */
  contentMaxWidthSmallTablet: 520,
  contentMaxWidthMediumTablet: 720,
  contentMaxWidthLargeTablet: 960,
  contentMaxWidthWide: 1200,

  smallTabletMinWidth: 600,
  mediumTabletMinWidth: 768,
  largeTabletMinWidth: 1024,
  wideMinWidth: 1280,
} as const;
