import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductCardWishlistBurstStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardWishlistBurstProps = {
  burstToken: number;
  active: boolean;
};

export const ProductCardWishlistBurst = ({ burstToken, active }: ProductCardWishlistBurstProps) => {
  const theme = useAppTheme();
  const styles = useProductCardWishlistBurstStyles();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (burstToken <= 0) {
      return;
    }

    scale.value = 0.35;
    opacity.value = 0;
    scale.value = withSequence(
      withSpring(1.18, { damping: 11, stiffness: 360 }),
      withSpring(1, { damping: 16, stiffness: 280 }),
    );
    opacity.value = withSequence(withTiming(1, { duration: 80 }), withTiming(0, { duration: 420 }));
  }, [burstToken, opacity, scale]);

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (burstToken <= 0) {
    return null;
  }

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, burstStyle]} pointerEvents="none">
      <MaterialIcons
        name={active ? "favorite" : "favorite-border"}
        size={56}
        color={theme.colors.danger}
      />
    </Animated.View>
  );
};
