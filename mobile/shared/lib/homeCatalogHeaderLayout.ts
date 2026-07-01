/** Паритет с web `AppShell.css` @media (max-width: 640px). */
export const HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET = 16;

/** Web `.app-shell--header-v1 .app-shell__header--v1` border-radius @640. */
export const HOME_CATALOG_HEADER_PANEL_RADIUS = 14;

/**
 * Web `.app-shell--header-v1 .app-shell__header--v1` padding @640:
 * `0.75rem 0.85rem 0.9rem`.
 */
export const HOME_CATALOG_HEADER_PANEL_PADDING = {
  top: 12,
  horizontal: 13.6,
  bottom: 12,
} as const;

/** Web `.app-shell--header-v1 .app-shell__header--v1` margin-bottom @mobile preview. */
export const HOME_CATALOG_HEADER_BOTTOM_MARGIN = 0;

/** Web `color-mix(in srgb, var(--iz-color-text) 8%, transparent)` on #111827. */
export const HOME_CATALOG_HEADER_PANEL_BORDER_COLOR = "rgba(17, 24, 39, 0.08)";

/** Web `backdrop-filter: blur(14px)` on glass header. */
export const HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS = 14;

/** Web `color-mix(on-contrast 86%, transparent)`. */
export const HOME_CATALOG_HEADER_PANEL_GLASS_OPACITY = 0.86;

/** Web `color-mix(in srgb, var(--iz-color-on-contrast) 86%, transparent)`. */
export const resolveHomeCatalogHeaderGlassTint = (
  onContrast: string,
  opacity = HOME_CATALOG_HEADER_PANEL_GLASS_OPACITY,
): string => {
  const hex = onContrast.replace("#", "");
  if (hex.length !== 6) {
    return `rgba(255, 255, 255, ${opacity})`;
  }

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/** @deprecated Use resolveHomeCatalogHeaderGlassTint(theme.colors.onContrast). */
export const HOME_CATALOG_HEADER_PANEL_GLASS_BACKGROUND = "rgba(255, 255, 255, 0.86)";

/** Web inset `0 1px 0 color-mix(on-contrast 65%)`. */
export const HOME_CATALOG_HEADER_PANEL_INSET_LINE_COLOR = "rgba(255, 255, 255, 0.65)";

/** Web `--iz-shadow-lg`. */
export const HOME_CATALOG_HEADER_PANEL_SHADOW = {
  color: "rgba(15, 23, 42, 0.07)",
  offsetY: 10,
  radius: 28,
} as const;

/** Web `--iz-shadow-card` on auth-actions pill. */
export const HOME_CATALOG_HEADER_USERS_PILL_SHADOW = "rgba(15, 23, 42, 0.05)";

/** Web `.app-shell__header-top` column gap `0.5rem` @640. */
export const HOME_CATALOG_HEADER_TOP_ROW_GAP = 8;

/** Отступ между glass-панелью шапки и каруселью баннера (sibling, не внутри panel). */
export const HOME_CATALOG_HEADER_BANNER_BELOW_PANEL_MARGIN = 8;

/** Web mobile-split header: высота от контента, не фикс. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT = 30.4;

/** Web `.app-shell__header--v1::before` height. */
export const HOME_CATALOG_HEADER_ACCENT_HEIGHT = 3;

/** Web `.app-shell__logo` height `clamp(2rem, 5vw, 2.5rem)` → 32px @mobile. */
export const HOME_CATALOG_HEADER_LOGO_HEIGHT = 32;

/** Web `max-width: min(9rem, 42vw)`. */
export const HOME_CATALOG_HEADER_LOGO_MAX_WIDTH_REM = 144;

export const resolveHomeCatalogHeaderLogoMaxWidth = (screenWidth: number): number =>
  Math.min(HOME_CATALOG_HEADER_LOGO_MAX_WIDTH_REM, screenWidth * 0.42);

/** Web `.header-circle-button` `2.25rem`. */
export const HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE = 36;

/** Web `.app-shell__auth-actions--mobile-top` padding `0.2rem` @640. */
export const HOME_CATALOG_HEADER_USERS_PILL_PADDING = 3.2;

/** Web `.app-shell__auth-actions--mobile-top` gap `0.3rem` @640. */
export const HOME_CATALOG_HEADER_USERS_PILL_GAP = 4.8;

/** Web `.search-input__field` padding vertical `0.45rem` @640. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_VERTICAL = 7.2;

/** Web `.search-input__field` padding-left `0.85rem`. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_LEFT = 13.6;

/** Web `.search-input__field` padding-right @640 `2rem`. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_RIGHT = 32;

/** Web `--iz-radius-input` `0.5rem`. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_BORDER_RADIUS = 8;

/** Web `.search-input__field` font-size `0.82rem` @640. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_FONT_SIZE = 13.12;

type ScreenSafeAreaInsets = {
  left?: number;
  right?: number;
};

export const resolveHomeCatalogHeaderShellInset = (
  insets: ScreenSafeAreaInsets = {},
): number =>
  Math.max(
    HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET,
    insets.left ?? 0,
    insets.right ?? 0,
  );

export const resolveHomeCatalogHeaderPanelPaddingTop = (safeAreaTop: number): number =>
  Math.max(safeAreaTop, HOME_CATALOG_HEADER_PANEL_PADDING.top);
