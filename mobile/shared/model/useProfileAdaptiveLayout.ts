import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import {
  MY_PROFILE_DRAWER_LAYOUT_MAX_PX,
  MY_PROFILE_PHONE_LAYOUT_MAX_PX,
} from "@/shared/lib/guestProfileLayout";
import { resolveViewportLayoutWidth } from "@/shared/lib/resolveViewportLayoutWidth";

export type ProfileAdaptiveLayout = {
  layoutWidth: number;
  /** ≤900 — как web drawer (toggle + sheet). */
  isDrawerLayout: boolean;
  /** ≤640 — phone chrome (filled toggle, sheet справа). */
  isPhoneLayout: boolean;
};

export const resolveProfileAdaptiveLayout = (windowWidth: number): ProfileAdaptiveLayout => {
  const layoutWidth = resolveViewportLayoutWidth(windowWidth);
  const isDrawerLayout = layoutWidth <= MY_PROFILE_DRAWER_LAYOUT_MAX_PX;
  const isPhoneLayout = layoutWidth <= MY_PROFILE_PHONE_LAYOUT_MAX_PX;
  return { layoutWidth, isDrawerLayout, isPhoneLayout };
};

export const useProfileAdaptiveLayout = (): ProfileAdaptiveLayout => {
  const { width } = useWindowDimensions();
  return useMemo(() => resolveProfileAdaptiveLayout(width), [width]);
};
