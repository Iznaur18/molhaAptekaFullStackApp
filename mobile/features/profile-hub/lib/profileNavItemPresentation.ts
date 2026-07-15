import type { TextStyle, ViewStyle } from "react-native";

import {
  resolveProfileNavTonePalette,
  type ProfileNavColorScheme,
  type ProfileNavToneId,
} from "@izibuy/shared-lib";

type ProfileNavItemVisualState = {
  isActive: boolean;
  isCta: boolean;
  colorScheme: ProfileNavColorScheme;
  onContrastColor: string;
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
  { isActive, isCta, colorScheme, onContrastColor }: ProfileNavItemVisualState,
): ProfileNavItemPresentation => {
  const palette = resolveProfileNavTonePalette(tone, colorScheme);
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

  const iconColor = highlighted ? onContrastColor : palette.main;

  const label: TextStyle = {
    color: highlighted ? palette.strong : undefined,
    fontWeight: highlighted ? "700" : "600",
  };

  return { container, iconWrap, iconColor, label };
};
