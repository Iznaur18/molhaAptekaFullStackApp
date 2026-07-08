import type { TextStyle, ViewStyle } from "react-native";

import {
  resolveProfileNavTonePalette,
  type ProfileNavToneId,
} from "@izibuy/shared-lib";
import { semanticColors } from "@/shared/theme/semanticColors";

type ProfileNavItemVisualState = {
  isActive: boolean;
  isCta: boolean;
};

export type ProfileNavItemPresentation = {
  container: ViewStyle;
  iconWrap: ViewStyle;
  iconColor: string;
  label: TextStyle;
};

const withAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

export const buildProfileNavItemPresentation = (
  tone: ProfileNavToneId,
  { isActive, isCta }: ProfileNavItemVisualState,
): ProfileNavItemPresentation => {
  const palette = resolveProfileNavTonePalette(tone);
  const highlighted = isActive || isCta;

  const container: ViewStyle = {
    borderLeftColor: isActive ? palette.main : "transparent",
    backgroundColor: highlighted ? palette.soft : "transparent",
  };

  const iconWrap: ViewStyle = highlighted
    ? {
        backgroundColor: palette.main,
        borderWidth: 0,
      }
    : {
        backgroundColor: palette.soft,
        borderWidth: 1,
        borderColor: withAlpha(palette.main, "2E"),
      };

  const iconColor = highlighted ? semanticColors.onContrast : palette.main;

  const label: TextStyle = {
    color: highlighted ? palette.strong : undefined,
    fontWeight: highlighted ? "700" : "600",
  };

  return { container, iconWrap, iconColor, label };
};
