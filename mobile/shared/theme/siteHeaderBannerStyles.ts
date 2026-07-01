import { Pressable, View } from "react-native";

import { SITE_HEADER_BANNER_LAYOUT } from "@/shared/lib/siteHeaderBannerLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useSiteHeaderBannerCarouselStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
  },
  viewport: {
    overflow: "hidden",
    borderRadius: SITE_HEADER_BANNER_LAYOUT.radius,
  },
  singleSlide: {
    width: "100%",
    minHeight: SITE_HEADER_BANNER_LAYOUT.height,
    borderRadius: SITE_HEADER_BANNER_LAYOUT.radius,
    overflow: "hidden",
  },
  slide: {
    width: "100%",
    minHeight: SITE_HEADER_BANNER_LAYOUT.height,
    overflow: "hidden",
    borderRadius: SITE_HEADER_BANNER_LAYOUT.radius,
  },
  pressable: {
    width: "100%",
    minHeight: SITE_HEADER_BANNER_LAYOUT.height,
  },
  image: {
    width: "100%",
    height: SITE_HEADER_BANNER_LAYOUT.height,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SITE_HEADER_BANNER_LAYOUT.dotGap,
    marginTop: SITE_HEADER_BANNER_LAYOUT.dotsTopMargin,
  },
  dot: {
    width: SITE_HEADER_BANNER_LAYOUT.dotSize,
    height: SITE_HEADER_BANNER_LAYOUT.dotSize,
    borderRadius: SITE_HEADER_BANNER_LAYOUT.dotSize / 2,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
}));
