import { useMemo } from "react";
import { useWindowDimensions, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resolveAppShellMaxWidthStyle } from "@/shared/lib/appShellLayout";
import { resolveViewportLayoutWidth } from "@/shared/lib/resolveViewportLayoutWidth";
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
import {
  resolveScreenContentPaddingBottom,
  resolveScreenContentPaddingHorizontal,
} from "@/shared/theme/screenContentLayout";

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
    const viewportWidth = resolveViewportLayoutWidth(width);
    const widthTier = resolveScreenWidthTier(viewportWidth);
    const isNarrow = resolveIsNarrowScreen(viewportWidth);
    const isTablet = resolveIsTabletScreen(viewportWidth);
    const isSmallTablet = resolveIsSmallTabletScreen(viewportWidth);
    const isMediumTablet = resolveIsMediumTabletScreen(viewportWidth);
    const isLargeTablet = resolveIsLargeTabletScreen(viewportWidth);
    const layoutWidth = resolveLayoutContentWidth(viewportWidth);
    const contentMaxWidth = resolveContentMaxWidth(viewportWidth);
    const profileContentMaxWidth = resolveProfileContentMaxWidth(viewportWidth);
    const contentPaddingHorizontal = resolveScreenContentPaddingHorizontal(safeAreaInsets);
    const contentPaddingTop = safeAreaInsets.top;
    const contentPaddingBottom = resolveScreenContentPaddingBottom(safeAreaInsets.bottom);

    const centeredContentStyle = resolveAppShellMaxWidthStyle(width);

    const profileContentStyle: ViewStyle = {
      width: "100%",
      maxWidth: profileContentMaxWidth,
      alignSelf: "center",
    };

    return {
      width: viewportWidth,
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
  }, [
    height,
    safeAreaInsets.bottom,
    safeAreaInsets.left,
    safeAreaInsets.right,
    safeAreaInsets.top,
    width,
  ]);
};
