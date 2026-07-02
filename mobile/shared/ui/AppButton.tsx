import { Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export type AppButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "ghost"
  | "contrast"
  | "outline";

type AppButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: AppButtonVariant;
  style?: StyleProp<ViewStyle>;
};

const useStyles = createThemedStyles((theme) => ({
  base: {
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: theme.colors.action,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  contrast: {
    backgroundColor: theme.colors.nearBlack,
  },
  outline: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.nearBlack,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  labelOnPrimary: {
    color: theme.colors.onContrast,
  },
  labelSecondary: {
    color: theme.colors.text,
  },
  labelDanger: {
    color: theme.colors.onContrast,
  },
  labelGhost: {
    color: theme.colors.link,
  },
  labelContrast: {
    color: theme.colors.onContrast,
  },
  labelOutline: {
    color: theme.colors.nearBlack,
  },
  disabled: {
    opacity: 0.55,
  },
}));

export const AppButton = ({
  label,
  variant = "primary",
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...pressableProps
}: AppButtonProps) => {
  const styles = useStyles();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyle =
    variant === "secondary"
      ? styles.secondary
      : variant === "danger"
        ? styles.danger
        : variant === "success"
          ? styles.success
          : variant === "ghost"
            ? styles.ghost
            : variant === "contrast"
              ? styles.contrast
              : variant === "outline"
                ? styles.outline
                : styles.primary;

  const labelStyle =
    variant === "secondary"
      ? styles.labelSecondary
      : variant === "ghost"
        ? styles.labelGhost
        : variant === "contrast"
          ? styles.labelContrast
          : variant === "outline"
            ? styles.labelOutline
            : styles.labelOnPrimary;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[styles.base, variantStyle, disabled && styles.disabled, style]}
        disabled={disabled}
        onPressIn={(e) => {
          scale.value = withSpring(0.96, { damping: 18, stiffness: 350 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 18, stiffness: 350 });
          onPressOut?.(e);
        }}
        {...pressableProps}
      >
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};
