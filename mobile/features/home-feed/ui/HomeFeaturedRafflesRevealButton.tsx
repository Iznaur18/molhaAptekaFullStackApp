import { Pressable, Text } from "react-native";

import { HOME_FEED_UI } from "@/shared/config";
import {
  RAFFLE_REVEAL_BUTTON_BORDER_RADIUS,
  useRaffleFeaturedSectionStyles,
} from "@/shared/theme/raffleFeaturedStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type HomeFeaturedRafflesRevealButtonProps = {
  onPress: () => void;
};

export const HomeFeaturedRafflesRevealButton = ({
  onPress,
}: HomeFeaturedRafflesRevealButtonProps) => {
  const styles = useRaffleFeaturedSectionStyles();
  const label = HOME_FEED_UI.SHOW_RAFFLES;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.revealButtonPressable,
        pressed ? styles.revealButtonPressed : null,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <SquircleView radius={RAFFLE_REVEAL_BUTTON_BORDER_RADIUS} style={styles.revealButton}>
        <Text style={styles.revealButtonText}>{label}</Text>
      </SquircleView>
    </Pressable>
  );
};
