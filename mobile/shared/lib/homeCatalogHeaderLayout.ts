/** Выравнивание контента ленты (карусели, баннеры) — не менять вместе с панелью. */
export const HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET = 16;

/** Ozon-стиль: панель от края до края. */
export const HOME_CATALOG_HEADER_PANEL_HORIZONTAL_INSET = 0;

/** Ozon-стиль: белая карта с крупным скруглением снизу. */
export const HOME_CATALOG_HEADER_PANEL_RADIUS = 18;

/** Панель прижата к верху экрана; safe-area — внутри paddingTop. */
export const HOME_CATALOG_HEADER_PANEL_TOP_GAP = 0;

/** Тонкая рамка панели вокруг крупного поля поиска. */
export const HOME_CATALOG_HEADER_PANEL_PADDING = {
  top: 8,
  horizontal: HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET,
  bottom: 8,
} as const;

/** Web `.app-shell--header-v1 .app-shell__header--v1` margin-bottom @mobile preview. */
export const HOME_CATALOG_HEADER_BOTTOM_MARGIN = 0;

/** Ozon-стиль: кромка почти незаметна — панель отделяется тенью. */
export const HOME_CATALOG_HEADER_PANEL_BORDER_COLOR = "rgba(17, 24, 39, 0.06)";

/** Blur остаётся для контента, уезжающего под панель. */
export const HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS = 18;

/** Ozon-стиль: почти непрозрачная белая карта. */
export const HOME_CATALOG_HEADER_PANEL_GLASS_OPACITY = 0.96;

/** Web `color-mix(in srgb, var(--iz-color-on-contrast) 80%, transparent)`. */
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

/** Мягкая тень под белой картой (Ozon-стиль). */
export const HOME_CATALOG_HEADER_PANEL_SHADOW = {
  color: "rgba(15, 23, 42, 0.08)",
  offsetY: 6,
  radius: 16,
} as const;

/** Web `--iz-shadow-card` on auth-actions pill. */
export const HOME_CATALOG_HEADER_USERS_PILL_SHADOW = "rgba(15, 23, 42, 0.05)";

/** Web `.app-shell__header-top` column gap `0.5rem` @640. */
export const HOME_CATALOG_HEADER_TOP_ROW_GAP = 8;

/** Отступ между glass-панелью шапки и каруселью баннера (sibling, не внутри panel). */
export const HOME_CATALOG_HEADER_BANNER_BELOW_PANEL_MARGIN = 8;

/** Ozon-стиль: крупное поле поиска. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT = 44;

/** Web `.app-shell__header--v1::before` height. */
export const HOME_CATALOG_HEADER_ACCENT_HEIGHT = 3;

/** Круглые кнопки шапки — высота как у поля поиска. */
export const HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE =
  HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT;

/** Web `.header-circle-button` `border-width: 1px`. */
export const HOME_CATALOG_HEADER_CIRCLE_BUTTON_BORDER_WIDTH = 1;

/** Stretch-menu: отступ между кнопкой-глазом и первым пунктом. */
export const HOME_CATALOG_HEADER_USERS_STRETCH_TOGGLE_GAP = 12;

/** Stretch-menu: gap between menu items. */
export const HOME_CATALOG_HEADER_USERS_STRETCH_ITEM_GAP = 8;

/** Stretch-menu: bottom inset inside blue pill. */
export const HOME_CATALOG_HEADER_USERS_STRETCH_BOTTOM_PADDING = 8;

export const resolveHomeCatalogUsersStretchMenuHeight = (itemCount: number): number => {
  if (itemCount <= 0) {
    return HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE;
  }

  return (
    HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE +
    HOME_CATALOG_HEADER_USERS_STRETCH_TOGGLE_GAP +
    itemCount * HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE +
    Math.max(0, itemCount - 1) * HOME_CATALOG_HEADER_USERS_STRETCH_ITEM_GAP +
    HOME_CATALOG_HEADER_USERS_STRETCH_BOTTOM_PADDING
  );
};

/** @deprecated Stretch-menu is anchored in header, not a floating dropdown. */
export const HOME_CATALOG_HEADER_USERS_MENU_GAP = 4;

/** @deprecated */
export const HOME_CATALOG_HEADER_USERS_MENU_MIN_WIDTH = HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE;

/** @deprecated */
export const HOME_CATALOG_HEADER_USERS_MENU_BORDER_RADIUS = 8;

/** Кнопки шапки без внешней обводки — паддинг не нужен. */
export const HOME_CATALOG_HEADER_USERS_PILL_PADDING = 0;

/** Web `.app-shell__auth-actions--mobile-top` gap `0.3rem` @640. */
export const HOME_CATALOG_HEADER_USERS_PILL_GAP = 4.8;

/** Вертикальный паддинг поисковой «пилюли». */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_VERTICAL = 8;

/** Левый паддинг поисковой «пилюли»: место под иконку-лупу. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_LEFT = 38;

/** Размер и отступ иконки-лупы внутри поля поиска. */
export const HOME_CATALOG_HEADER_SEARCH_ICON_SIZE = 20;
export const HOME_CATALOG_HEADER_SEARCH_ICON_LEFT = 14;

/** Правый паддинг (место под clear-кнопку). */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_RIGHT = 36;

/** Ozon-стиль: скруглённый прямоугольник, не пилюля. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_BORDER_RADIUS = 14;

/** Ozon-стиль: крупный читабельный шрифт поиска. */
export const HOME_CATALOG_HEADER_SEARCH_INPUT_FONT_SIZE = 16;

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

/** Боковые поля панели поиска — 0, full-bleed. */
export const resolveHomeCatalogHeaderPanelInset = (): number =>
  HOME_CATALOG_HEADER_PANEL_HORIZONTAL_INSET;

/** Панель от верхнего края scene; safe-area учитывается в paddingTop. */
export const resolveHomeCatalogHeaderPanelTopMargin = (): number =>
  HOME_CATALOG_HEADER_PANEL_TOP_GAP;

export const resolveHomeCatalogHeaderPanelPaddingTop = (safeAreaTop: number): number =>
  safeAreaTop + HOME_CATALOG_HEADER_PANEL_PADDING.top;
