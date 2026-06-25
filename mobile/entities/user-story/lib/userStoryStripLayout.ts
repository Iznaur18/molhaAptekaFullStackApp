/** Пиксель-паритет с `client/src/entities/user-story/ui/UserStoriesStrip.css`. */
export const USER_STORY_STRIP_COLORS = {
  scrollBackground: "rgba(32, 35, 40, 1)",
  ringActive: "#1d9bf0",
  ringViewed: "#9ca3af",
  avatarBorder: "#ffffff",
  countBackground: "#2563eb",
} as const;

export const USER_STORY_STRIP_LAYOUT = {
  marginBottom: 16,
  paddingTop: 8,
  paddingBottom: 4,
  scrollBorderRadius: 20,
  scrollPaddingLeft: 14,
  scrollPaddingRight: 4,
  scrollPaddingTop: 12,
  scrollPaddingBottom: 12,
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
} as const;

export const USER_STORY_STRIP_INNER_SIZE =
  USER_STORY_STRIP_LAYOUT.ringSize - USER_STORY_STRIP_LAYOUT.ringPadding * 2;
