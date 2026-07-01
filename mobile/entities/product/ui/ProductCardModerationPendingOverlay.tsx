import { Text, View } from "react-native";

import { PRODUCT_MODERATION_PAGE_UI } from "@/shared/config";
import { useProductCardMediaStyles } from "@/shared/theme/catalogProductStyles";

export const ProductCardModerationPendingOverlay = () => {
  const styles = useProductCardMediaStyles();

  return (
    <View style={styles.moderationPendingOverlay} pointerEvents="none" accessibilityRole="text">
      <Text style={styles.moderationPendingOverlayText}>
        {PRODUCT_MODERATION_PAGE_UI.BADGE_PENDING}
      </Text>
    </View>
  );
};
