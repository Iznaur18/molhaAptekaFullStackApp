import { useMemo } from "react";
import { Platform, useWindowDimensions, type ViewStyle } from "react-native";

import {
  resolveProductDetailDockScrollPadding,
  resolveProductDetailHeroSize,
  resolveProductDetailPageShellRounded,
  resolveProductDetailPageSplit,
  type ProductDetailHeroSize,
} from "@/shared/lib/productDetailScreenLayout";
import { resolveViewportLayoutWidth } from "@/shared/lib/resolveViewportLayoutWidth";

export type ProductDetailPageLayout = {
  viewportWidth: number;
  isPageSplit: boolean;
  isPageShellRounded: boolean;
  heroSize: ProductDetailHeroSize;
  resolveScrollPaddingBottom: (bottomInset: number, showMobileDock: boolean) => number;
  pageShellStyle: ViewStyle | null;
};

export const useProductDetailPageLayout = (): ProductDetailPageLayout => {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const viewportWidth = resolveViewportLayoutWidth(width);
    const isPageSplit = resolveProductDetailPageSplit(viewportWidth);
    const isPageShellRounded = resolveProductDetailPageShellRounded(viewportWidth);
    const heroSize = resolveProductDetailHeroSize(viewportWidth, isPageSplit);

    return {
      viewportWidth,
      isPageSplit,
      isPageShellRounded,
      heroSize,
      resolveScrollPaddingBottom: (bottomInset, showMobileDock) =>
        resolveProductDetailDockScrollPadding(bottomInset, showMobileDock),
      pageShellStyle: isPageShellRounded
        ? ({
            borderRadius: 28,
            overflow: "hidden",
            ...(typeof Platform !== "undefined" &&
            Platform.OS === "ios"
              ? { borderCurve: "continuous" as const }
              : null),
          } as ViewStyle)
        : null,
    };
  }, [width]);
};
