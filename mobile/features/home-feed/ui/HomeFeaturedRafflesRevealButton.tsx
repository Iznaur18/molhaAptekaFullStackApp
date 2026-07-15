import { Pressable, Text, View } from "react-native";

import { HOME_FEED_UI } from "@/shared/config";
import {
  RAFFLE_REVEAL_BUTTON_BORDER_RADIUS,
  useRaffleFeaturedSectionStyles,
} from "@/shared/theme/raffleFeaturedStyles";
import { RainbowFlowBackdrop } from "@/shared/ui/RainbowFlowBackdrop";
import { SquircleView } from "@/shared/ui/SquircleView";

type HomeFeaturedRafflesRevealButtonProps = {
  isExpanded: boolean;
  onPress: () => void;
};

export const HomeFeaturedRafflesRevealButton = ({
  isExpanded,
  onPress,
}: HomeFeaturedRafflesRevealButtonProps) => {
  const styles = useRaffleFeaturedSectionStyles();
  const label = isExpanded
    ? HOME_FEED_UI.HIDE_RAFFLES
    : HOME_FEED_UI.SHOW_RAFFLES;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.revealButtonPressable,
        pressed ? styles.revealButtonPressed : null,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      accessibilityLabel={label}
    >
      <SquircleView
        radius={RAFFLE_REVEAL_BUTTON_BORDER_RADIUS}
        style={styles.revealButton}
      >
        <View pointerEvents="none" style={styles.revealButtonFlow}>
          <RainbowFlowBackdrop />
        </View>
        <Text style={styles.revealButtonText}>{label}</Text>
      </SquircleView>
    </Pressable>
  );
};
