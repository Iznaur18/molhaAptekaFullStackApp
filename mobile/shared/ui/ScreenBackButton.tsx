import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SCREEN_BACK_UI } from "@/shared/config";
import { navigateBackOrHome } from "@/shared/lib/navigateBackOrHome";
import {
  SCREEN_BACK_BUTTON_LEFT_INSET,
  SCREEN_BACK_BUTTON_TOP_INSET,
} from "@/shared/lib/screenBackButtonLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useScreenBackButtonStyles } from "@/shared/theme/screenBackButtonStyles";

type ScreenBackButtonProps = {
  variant?: "overlay" | "inline";
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const ScreenBackButton = ({
  variant = "overlay",
  accessibilityLabel = SCREEN_BACK_UI.BACK_ARIA,
  disabled = false,
  onPress,
  style,
}: ScreenBackButtonProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useScreenBackButtonStyles();
  const isOverlay = variant === "overlay";

  return (
    <Pressable
      style={[
        isOverlay ? styles.button : styles.buttonInline,
        isOverlay
          ? [
              styles.overlay,
              {
                top: insets.top + SCREEN_BACK_BUTTON_TOP_INSET,
                left: Math.max(insets.left, SCREEN_BACK_BUTTON_LEFT_INSET),
              },
            ]
          : null,
        disabled && isOverlay ? styles.buttonDisabled : null,
        style,
      ]}
      onPress={onPress ?? (() => navigateBackOrHome(router))}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <Feather
        name="chevron-left"
        size={22}
        color={isOverlay ? theme.colors.link : theme.colors.text}
      />
    </Pressable>
  );
};
