/**
 * Типографика.
 *
 * Body font:
 * - Web CSS: `Inter, system-ui, …` (`--iz-font-family` в designTokens.css).
 * - RN: `"System"` — platform-исключение (Inter в Expo не грузим; Display = Intro отдельно).
 *
 * Шкала `font*` = mobile parity scale (`--iz-font-2xs…7xl` в designTokens.css).
 * Legacy `sizeXs…size2xl` сохранены для совместимости (не совпадают 1:1 с CSS-именами).
 */
export const izTypography = {
  /** RN body. Web использует `fontFamilyWeb` через CSS, не этот ключ. */
  fontFamily: "System",
  fontFamilyWeb: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  /** Display CAPS — грузится как "Intro" в mobile/app/_layout.tsx и web @font-face. */
  fontFamilyDisplay: "Intro",
  lineHeight: 1.5,

  fontWeightRegular: "400" as const,
  fontWeightMedium: "500" as const,
  fontWeightSemibold: "600" as const,
  fontWeightBold: "700" as const,

  /** `--iz-font-2xs` … `--iz-font-7xl` */
  font2xs: 11,
  fontXs: 12,
  fontSm: 13,
  fontBase: 14,
  fontMd: 15,
  fontLg: 16,
  fontXl: 17,
  font2xl: 18,
  font3xl: 20,
  font4xl: 22,
  font5xl: 24,
  font6xl: 26,
  font7xl: 28,

  /** Absolute line-heights (`--iz-leading-*`) */
  leading2xs: 16,
  leadingXs: 17,
  leadingSm: 18,
  leadingBase: 20,
  leadingLg: 22,
  leadingXl: 24,
  leadingRelaxed: 1.35,

  /** @deprecated prefer fontXs / fontBase / fontLg / font2xl / font4xl / font5xl */
  sizeXs: 12,
  sizeSm: 14,
  sizeMd: 16,
  sizeLg: 18,
  sizeXl: 22,
  size2xl: 24,
} as const;
