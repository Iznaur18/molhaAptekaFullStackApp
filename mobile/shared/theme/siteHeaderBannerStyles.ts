import { StyleSheet } from "react-native";

import { SITE_HEADER_BANNER_LAYOUT } from "@/shared/lib/siteHeaderBannerLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useSiteHeaderBannerCarouselStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
  },
  viewport: {
    position: "relative",
    overflow: "hidden",
    borderRadius: SITE_HEADER_BANNER_LAYOUT.radius,
  },
  singleSlide: {
    position: "relative",
    width: "100%",
    minHeight: SITE_HEADER_BANNER_LAYOUT.height,
    overflow: "hidden",
    borderRadius: SITE_HEADER_BANNER_LAYOUT.radius,
  },
  slide: {
    position: "relative",
    width: "100%",
    minHeight: SITE_HEADER_BANNER_LAYOUT.height,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  pressable: {
    width: "100%",
    minHeight: SITE_HEADER_BANNER_LAYOUT.height,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  imageBg: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: SITE_HEADER_BANNER_LAYOUT.imageBlurScale }],
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: SITE_HEADER_BANNER_LAYOUT.dotsBottomInset,
    flexDirection: "row",
    justifyContent: "center",
    gap: SITE_HEADER_BANNER_LAYOUT.dotGap,
    zIndex: 5,
    elevation: 5,
  },
  dot: {
    width: SITE_HEADER_BANNER_LAYOUT.dotSize,
    height: SITE_HEADER_BANNER_LAYOUT.dotSize,
    borderRadius: SITE_HEADER_BANNER_LAYOUT.dotSize / 2,
    backgroundColor: `${theme.colors.onContrast}66`,
  },
  dotActive: {
    width: SITE_HEADER_BANNER_LAYOUT.dotActiveWidth,
    backgroundColor: theme.colors.onContrast,
  },
  adBadge: {
    position: "absolute",
    top: SITE_HEADER_BANNER_LAYOUT.adBadgeInset,
    left: SITE_HEADER_BANNER_LAYOUT.adBadgeInset,
    zIndex: 4,
    elevation: 4,
    paddingHorizontal: SITE_HEADER_BANNER_LAYOUT.adBadgePaddingHorizontal,
    paddingVertical: SITE_HEADER_BANNER_LAYOUT.adBadgePaddingVertical,
    borderRadius: SITE_HEADER_BANNER_LAYOUT.adBadgeBorderRadius,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
  },
  adBadgeText: {
    color: theme.colors.ink,
    fontSize: SITE_HEADER_BANNER_LAYOUT.adBadgeFontSize,
    fontWeight: "600",
    letterSpacing: SITE_HEADER_BANNER_LAYOUT.adBadgeLetterSpacing,
  },
  viewportEdgeToEdge: {
    borderRadius: 0,
  },
  slideEdgeToEdge: {
    borderRadius: 0,
  },
  singleSlideEdgeToEdge: {
    borderRadius: 0,
  },
}));
