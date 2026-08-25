import {
  SITE_HEADER_BANNER_HEIGHT_PX,
  resolveSiteHeaderBannerHeightPx,
} from "@molha/api-contract";
import { RAFFLE_FEATURED_CARD_BORDER_RADIUS } from "@izibuy/shared-lib";

export const SITE_HEADER_BANNER_LAYOUT = {
  /** Fallback / phone; runtime — `resolveSiteHeaderBannerHeightPx(windowWidth)`. */
  height: SITE_HEADER_BANNER_HEIGHT_PX,
  radius: RAFFLE_FEATURED_CARD_BORDER_RADIUS,
  /** Паритет web `filter: blur(28px)` + `scale(1.16)`. */
  imageBlurRadius: 28,
  imageBlurScale: 1.16,
  dotSize: 6,
  /** Паритет web `.site-header-banner-carousel__dot_active`. */
  dotActiveWidth: 16,
  dotGap: 6,
  dotsBottomInset: 8,
  adBadgeInset: 10,
  adBadgePaddingHorizontal: 10,
  adBadgePaddingVertical: 2,
  adBadgeBorderRadius: 4,
  adBadgeFontSize: 7,
  adBadgeLetterSpacing: 0.12,
} as const;

export { resolveSiteHeaderBannerHeightPx };
