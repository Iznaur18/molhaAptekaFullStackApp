import { SITE_HEADER_BANNER_HEIGHT_PX } from "@molha/api-contract";
import { RAFFLE_FEATURED_CARD_BORDER_RADIUS } from "@izibuy/shared-lib";

export const SITE_HEADER_BANNER_LAYOUT = {
  height: SITE_HEADER_BANNER_HEIGHT_PX,
  radius: RAFFLE_FEATURED_CARD_BORDER_RADIUS,
  dotSize: 6,
  dotGap: 6,
  dotsBottomInset: 8,
  adBadgeInset: 10,
  adBadgePaddingHorizontal: 10,
  adBadgePaddingVertical: 2,
  adBadgeBorderRadius: 4,
  adBadgeFontSize: 7,
  adBadgeLetterSpacing: 0.12,
} as const;
