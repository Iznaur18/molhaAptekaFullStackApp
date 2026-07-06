import { useMemo } from "react";
import { useWindowDimensions, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  resolveScreenContentPaddingBottom,
  resolveScreenContentPaddingHorizontal,
} from "@/shared/theme/screenContentLayout";
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
  contentPaddingHorizontal: number;
  contentPaddingTop: number;
  contentPaddingBottom: number;
  centeredContentStyle: ViewStyle;
  profileContentStyle: ViewStyle;
};

export const useScreenLayout = (): ScreenLayout => {
  const { width, height } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();

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
    const contentPaddingHorizontal = resolveScreenContentPaddingHorizontal(safeAreaInsets);
    const contentPaddingTop = safeAreaInsets.top;
    const contentPaddingBottom = resolveScreenContentPaddingBottom(safeAreaInsets.bottom);

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
      contentPaddingHorizontal,
      contentPaddingTop,
      contentPaddingBottom,
      centeredContentStyle,
      profileContentStyle,
    };
  }, [height, safeAreaInsets.bottom, safeAreaInsets.left, safeAreaInsets.right, safeAreaInsets.top, width]);
};
