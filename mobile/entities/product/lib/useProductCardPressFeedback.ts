import { useCallback } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from "react-native-reanimated";

const PRODUCT_CARD_PRESS_SPRING: WithSpringConfig = {
  damping: 22,
  stiffness: 420,
};

const PRODUCT_CARD_RELEASE_SPRING: WithSpringConfig = {
  damping: 18,
  stiffness: 320,
};

export const useProductCardPressFeedback = () => {
  const scale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onCardPressIn = useCallback(() => {
    scale.value = withSpring(0.978, PRODUCT_CARD_PRESS_SPRING);
  }, [scale]);

  const onCardPressOut = useCallback(() => {
    scale.value = withSpring(1, PRODUCT_CARD_RELEASE_SPRING);
  }, [scale]);

  return {
    cardAnimatedStyle,
    onCardPressIn,
    onCardPressOut,
  };
};
