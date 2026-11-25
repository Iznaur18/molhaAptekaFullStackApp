import { izInteraction } from "@izibuy/design-tokens";
import { Pressable, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

/**
 * Pressable с spring-scale паритет web `--iz-transition-press` (180ms).
 * Те же damping/stiffness, что `AppButton`.
 */
const PRESS_SPRING = {
  damping: izInteraction.pressSpringDamping,
  stiffness: izInteraction.pressSpringStiffness,
} as const;

type PressableScaleProps = PressableProps;

export const PressableScale = ({
  onPressIn,
  onPressOut,
  style,
  children,
  disabled,
  ...pressableProps
}: PressableScaleProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={style}
        disabled={disabled}
        onPressIn={(e) => {
          if (!disabled) {
            scale.value = withSpring(izInteraction.pressedScale, PRESS_SPRING);
          }
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, PRESS_SPRING);
          onPressOut?.(e);
        }}
        {...pressableProps}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};
