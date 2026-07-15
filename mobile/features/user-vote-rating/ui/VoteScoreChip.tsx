import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  resolveVoteScoreChipColors,
  type VoteScoreChipColors,
} from "@/entities/user-vote-rating/lib/resolveVoteScoreTone";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useUserVoteRatingStyles } from "@/shared/theme/accountFeatureStyles";

const CHIP_PRESS_SCALE = 0.94;
const SPRING_CONFIG = { damping: 18, stiffness: 350 } as const;

type VoteScoreChipProps = {
  value: number;
  selected: boolean;
  disabled: boolean;
  onPress: (value: number) => void;
};

export const VoteScoreChip = ({ value, selected, disabled, onPress }: VoteScoreChipProps) => {
  const theme = useAppTheme();
  const styles = useUserVoteRatingStyles();
  const scale = useSharedValue(1);

  const chipColors: VoteScoreChipColors = resolveVoteScoreChipColors(
    value,
    selected,
    theme.colors,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.scoreChipWrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={`Оценка ${value}`}
        disabled={disabled}
        onPress={() => onPress(value)}
        onPressIn={() => {
          scale.value = withSpring(CHIP_PRESS_SCALE, SPRING_CONFIG);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING_CONFIG);
        }}
        style={[
          styles.scoreChip,
          selected && styles.scoreChipSelectedRing,
          {
            backgroundColor: chipColors.background,
            borderColor: chipColors.border,
            opacity: disabled && !selected ? 0.55 : 1,
          },
        ]}
      >
        <Text style={[styles.scoreChipText, { color: chipColors.text }]}>{value}</Text>
      </Pressable>
    </Animated.View>
  );
};
