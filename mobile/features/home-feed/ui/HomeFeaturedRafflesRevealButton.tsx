import ChevronRight from "lucide-react-native/icons/chevron-right";
import Gift from "lucide-react-native/icons/gift";
import { Pressable, Text, View } from "react-native";

import { RaffleRevealButtonGradient } from "@/features/home-feed/ui/RaffleRevealButtonGradient";
import { HOME_FEED_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
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
  const theme = useAppTheme();
  const label = HOME_FEED_UI.SHOW_RAFFLES;
  const iconColor = theme.colors.onContrast;

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
      <SquircleView
        radius={RAFFLE_REVEAL_BUTTON_BORDER_RADIUS}
        style={styles.revealButton}
      >
        <RaffleRevealButtonGradient />
        <View style={styles.revealLabel}>
          <Gift size={18} color={iconColor} />
          <Text style={styles.revealButtonText}>{label}</Text>
        </View>
        <ChevronRight size={18} color={iconColor} style={styles.revealChevron} />
      </SquircleView>
    </Pressable>
  );
};
