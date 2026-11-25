/**
 * Display-типографика Intro — паритет web `--iz-font-display` / displayFont.css.
 * Шрифт: IntroDemo-BlackCAPS (загружается в app/_layout.tsx как "Intro").
 * Body font на RN — System (platform); web body — Inter. Не смешивать с Intro.
 */

import { izTypography } from "@izibuy/design-tokens";

export const DISPLAY_FONT_FAMILY = izTypography.fontFamilyDisplay;

/** `.home-feed-section-title`, `.user-stories-strip__title`, curated carousel titles */
export const HOME_FEED_DISPLAY_TITLE = {
  fontFamily: DISPLAY_FONT_FAMILY,
  /** clamp(1.08rem … 1.28rem) mid ≈ 18px */
  fontSize: 18,
  fontWeight: "400" as const,
  lineHeight: 21,
  letterSpacing: 0.72,
  textTransform: "uppercase" as const,
  paddingLeft: 16,
  paddingRight: 2,
  /**
   * Web `.home-feed-section-title { margin: 1rem 0 }` (=16/16).
   * Top: 8 + listHeader `HOME_FEED_SECTION_GAP` (8) → 16.
   */
  marginTop: 8,
  marginBottom: 16,
} as const;

/** Web `.home-feed-section-title` — полный `margin-top: 1rem` без listHeader gap. */
export const HOME_CATALOG_SECTION_TITLE_MARGIN_TOP = 16;

/** `.catalog-feed-tiles__title` / `.catalog-browser-landing__categories-title` */
export const CATALOG_BROWSER_DISPLAY_TITLE = {
  fontFamily: DISPLAY_FONT_FAMILY,
  fontSize: 22,
  fontWeight: "800" as const,
  lineHeight: 25,
  letterSpacing: -0.77,
} as const;
