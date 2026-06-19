/** Пиксель-паритет с `client/src/entities/user-story/ui/UserStoriesStrip.css`. */
export const USER_STORY_STRIP_LAYOUT = {
  marginBottom: 16,
  paddingTop: 8,
  paddingBottom: 4,
  scrollPaddingHorizontal: 4,
  scrollPaddingTop: 4,
  scrollPaddingBottom: 8,
  itemGap: 14,
  itemWidth: 78,
  itemContentGap: 6,
  ringSize: 68,
  ringBorderWidth: 2,
  labelFontSize: 12,
} as const;

export const USER_STORY_STRIP_AVATAR_SIZE =
  USER_STORY_STRIP_LAYOUT.ringSize - USER_STORY_STRIP_LAYOUT.ringBorderWidth * 2;
