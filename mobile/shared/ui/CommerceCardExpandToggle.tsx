import { Pressable, Text } from "react-native";

import { COMMERCE_CARD_UI } from "@/shared/config";
import { useCommerceCardExpandToggleStyles } from "@/shared/theme/commerceCardExpandToggleStyles";

const EXPAND_TOGGLE_HIT_SLOP = 8;

type CommerceCardExpandToggleProps = {
  expanded: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

export const CommerceCardExpandToggle = ({
  expanded,
  onPress,
  accessibilityLabel = COMMERCE_CARD_UI.EXPAND_TOGGLE_ARIA(expanded),
}: CommerceCardExpandToggleProps) => {
  const styles = useCommerceCardExpandToggleStyles();

  return (
    <Pressable
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      <Text style={styles.label}>{COMMERCE_CARD_UI.EXPAND_TOGGLE_LABEL(expanded)}</Text>
    </Pressable>
  );
};
