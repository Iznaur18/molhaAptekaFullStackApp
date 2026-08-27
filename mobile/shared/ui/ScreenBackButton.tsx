import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SCREEN_BACK_UI } from "@/shared/config";
import { navigateBackOrHome } from "@/shared/lib/navigateBackOrHome";
import { SCREEN_BACK_BUTTON_EDGE } from "@/shared/lib/screenBackButtonLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useScreenBackButtonStyles } from "@/shared/theme/screenBackButtonStyles";

type ScreenBackButtonProps = {
  variant?: "overlay" | "inline";
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export const ScreenBackButton = ({
  variant = "overlay",
  accessibilityLabel = SCREEN_BACK_UI.BACK_ARIA,
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
          ? [styles.overlay, { top: insets.top + SCREEN_BACK_BUTTON_EDGE }]
          : null,
        style,
      ]}
      onPress={() => navigateBackOrHome(router)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <MaterialIcons name="chevron-left" size={28} color={theme.colors.text} />
    </Pressable>
  );
};
