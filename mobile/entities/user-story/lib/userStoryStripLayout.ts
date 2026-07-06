/** Плашка сториз — фон/рамка через theme в useUserStoriesStripStyles. */
import { HOME_FEED_SECTION_GAP } from "@/features/home-feed/lib/homeFeedSectionLayout";

export const USER_STORY_STRIP_COLORS = {
  scrollBackground: "#ffffff",
  ringActive: "#1d9bf0",
  ringViewed: "#9ca3af",
  avatarBorder: "#ffffff",
  countBackground: "#2563eb",
} as const;

export const USER_STORY_STRIP_LAYOUT = {
  marginBottom: HOME_FEED_SECTION_GAP,
  paddingTop: 8,
  paddingBottom: 4,
  scrollBorderRadius: 20,
  scrollPaddingLeft: 12,
  scrollPaddingRight: 4,
  scrollPaddingTop: 8,
  scrollPaddingBottom: 8,
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
