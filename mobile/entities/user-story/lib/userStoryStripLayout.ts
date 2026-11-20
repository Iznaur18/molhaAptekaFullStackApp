/** Плашка сториз — цвета только через theme в useUserStoriesStripStyles. */

export const USER_STORY_STRIP_LAYOUT = {
  marginBottom: 0,
  paddingTop: 0,
  paddingBottom: 0,
  /** Web: без карточки-подложки (UserStoriesStrip.css, нояб 2026). */
  scrollBorderRadius: 0,
  blockPaddingHorizontal: 0,
  blockPaddingVertical: 0,
  titleMarginBottom: 0,
  titlePaddingHorizontal: 0,
  /** Web `.user-stories-strip__scroll { padding: 4px 2px 6px }` */
  scrollPaddingLeft: 2,
  scrollPaddingRight: 2,
  scrollPaddingTop: 4,
  scrollPaddingBottom: 6,
  itemGap: 14,
  itemWidth: 78,
  itemContentGap: 6,
  ringSize: 68,
  ringPadding: 3,
  avatarBorderWidth: 2,
  plusFontSize: 28,
  labelFontSize: 12,
  countMinWidth: 20,
  countHeight: 20,
  countPaddingHorizontal: 5,
  countFontSize: 12,
  avatarFallbackFontSize: 22,
  /** lineHeight лейбла — фиксируем, иначе track height плавает. */
  labelLineHeight: 15,
} as const;

export const USER_STORY_STRIP_INNER_SIZE =
  USER_STORY_STRIP_LAYOUT.ringSize - USER_STORY_STRIP_LAYOUT.ringPadding * 2;

/**
 * Высота горизонтального трека сториз.
 * Без жёсткой высоты RN Web/Expo Go тянет FlatList/ScrollView на весь экран
 * (`flexGrow: 1` + `Image` 100%).
 */
export const USER_STORY_STRIP_TRACK_HEIGHT =
  USER_STORY_STRIP_LAYOUT.scrollPaddingTop +
  USER_STORY_STRIP_LAYOUT.ringSize +
  USER_STORY_STRIP_LAYOUT.itemContentGap +
  USER_STORY_STRIP_LAYOUT.labelLineHeight +
  USER_STORY_STRIP_LAYOUT.scrollPaddingBottom;
