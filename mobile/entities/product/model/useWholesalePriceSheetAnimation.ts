import type { ViewStyle } from "react-native";
import { Easing } from "react-native-reanimated";

import { WHOLESALE_PRICE_SHEET_ANIMATION } from "@/entities/product/lib/wholesalePriceSheetAnimation";
import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";

const { enterMs, exitMs } = WHOLESALE_PRICE_SHEET_ANIMATION;

const enterEasing = Easing.bezierFn(0.215, 0.61, 0.355, 1);
const exitEasing = Easing.bezierFn(0.55, 0.055, 0.675, 1);

type WholesalePriceSheetAnimation = {
  modalVisible: boolean;
  backdropAnimatedStyle: ViewStyle;
  sheetAnimatedStyle: ViewStyle;
  useCssTransition: boolean;
};

/**
 * Sheet enter/exit. На web CSS `transition*` через RN View не анимирует transform —
 * всегда Reanimated (как ProfileMobileNavSheet).
 */
export const useWholesalePriceSheetAnimation = (
  visible: boolean,
  sheetSlideDistance: number,
): WholesalePriceSheetAnimation => {
  const slideDistance = Math.max(sheetSlideDistance, 1);

  const animation = useAdminEditModalAnimation(visible, {
    sheetSlideDistance: slideDistance,
    enterMs,
    exitMs,
    enterEasing,
    exitEasing,
    deferEnterUntilPaint: true,
  });

  return {
    ...animation,
    useCssTransition: false,
  };
};
