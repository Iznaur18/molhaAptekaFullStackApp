import type { ViewStyle } from "react-native";
import { Easing } from "react-native-reanimated";

import { VIEWER_REGION_PICKER_SHEET_ANIMATION } from "@/entities/region/lib/viewerRegionPickerSheetAnimation";
import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";

const { enterMs, exitMs } = VIEWER_REGION_PICKER_SHEET_ANIMATION;

const enterEasing = Easing.bezierFn(0.215, 0.61, 0.355, 1);
const exitEasing = Easing.bezierFn(0.55, 0.055, 0.675, 1);

type ViewerRegionPickerSheetAnimation = {
  modalVisible: boolean;
  backdropAnimatedStyle: ViewStyle;
  sheetAnimatedStyle: ViewStyle;
  useCssTransition: boolean;
};

/**
 * Sheet enter/exit. На web CSS `transition*` через RN View не анимирует transform —
 * всегда Reanimated (как useWholesalePriceSheetAnimation).
 */
export const useViewerRegionPickerSheetAnimation = (
  open: boolean,
  sheetSlideDistance: number,
): ViewerRegionPickerSheetAnimation => {
  const animation = useAdminEditModalAnimation(open, {
    sheetSlideDistance,
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
