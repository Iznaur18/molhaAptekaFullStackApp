import { useMemo } from "react";
import { useWindowDimensions, type ViewStyle } from "react-native";

import {
  resolveContentMaxWidth,
  resolveIsLargeTabletScreen,
  resolveIsMediumTabletScreen,
  resolveIsNarrowScreen,
  resolveIsSmallTabletScreen,
  resolveIsTabletScreen,
  resolveLayoutContentWidth,
  resolveProfileContentMaxWidth,
  resolveScreenWidthTier,
  type ScreenWidthTier,
} from "@/shared/lib/screenBreakpoints";

export type ScreenLayout = {
  width: number;
  height: number;
  layoutWidth: number;
  widthTier: ScreenWidthTier;
  isNarrow: boolean;
  isTablet: boolean;
  isSmallTablet: boolean;
  isMediumTablet: boolean;
  isLargeTablet: boolean;
  contentMaxWidth: number | undefined;
  profileContentMaxWidth: number;
  centeredContentStyle: ViewStyle;
  profileContentStyle: ViewStyle;
};

export const useScreenLayout = (): ScreenLayout => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const widthTier = resolveScreenWidthTier(width);
    const isNarrow = resolveIsNarrowScreen(width);
    const isTablet = resolveIsTabletScreen(width);
    const isSmallTablet = resolveIsSmallTabletScreen(width);
    const isMediumTablet = resolveIsMediumTabletScreen(width);
    const isLargeTablet = resolveIsLargeTabletScreen(width);
    const layoutWidth = resolveLayoutContentWidth(width);
    const contentMaxWidth = resolveContentMaxWidth(width);
    const profileContentMaxWidth = resolveProfileContentMaxWidth(width);

    const centeredContentStyle: ViewStyle = contentMaxWidth
      ? { width: "100%", maxWidth: contentMaxWidth, alignSelf: "center" }
      : { width: "100%" };

    const profileContentStyle: ViewStyle = {
      width: "100%",
      maxWidth: profileContentMaxWidth,
      alignSelf: "center",
    };

    return {
      width,
      height,
      layoutWidth,
      widthTier,
      isNarrow,
      isTablet,
      isSmallTablet,
      isMediumTablet,
      isLargeTablet,
      contentMaxWidth,
      profileContentMaxWidth,
      centeredContentStyle,
      profileContentStyle,
    };
  }, [width, height]);
};
