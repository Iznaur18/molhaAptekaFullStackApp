/**
 * Display-типографика Intro — паритет web `--iz-font-display` / displayFont.css.
 * Шрифт: IntroDemo-BlackCAPS (загружается в app/_layout.tsx как "Intro").
 */

export const DISPLAY_FONT_FAMILY = "Intro";

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
   * Web `margin: 1.2rem 0 0.4rem` (=19/6).
   * Top: 11 + listHeader `HOME_FEED_SECTION_GAP` (8) → 19.
   */
  marginTop: 11,
  marginBottom: 6,
} as const;

/** Web `.home-feed-section-title` — полный `margin-top: 1.2rem` без listHeader gap. */
export const HOME_CATALOG_SECTION_TITLE_MARGIN_TOP = 19;

/** `.catalog-feed-tiles__title` / `.catalog-browser-landing__categories-title` */
export const CATALOG_BROWSER_DISPLAY_TITLE = {
  fontFamily: DISPLAY_FONT_FAMILY,
  fontSize: 22,
  fontWeight: "800" as const,
  lineHeight: 25,
  letterSpacing: -0.77,
} as const;
