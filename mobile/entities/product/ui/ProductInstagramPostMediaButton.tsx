import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, View } from "react-native";

import { PRODUCT_INSTAGRAM_POST_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductInstagramPostMediaButtonStyles } from "@/shared/theme/catalogProductStyles";

type ProductInstagramPostMediaButtonProps = {
  onPress: () => void;
  size?: "card" | "detail";
};

export const ProductInstagramPostMediaButton = ({
  onPress,
  size = "card",
}: ProductInstagramPostMediaButtonProps) => {
  const theme = useAppTheme();
  const styles = useProductInstagramPostMediaButtonStyles();
  const isDetail = size === "detail";

  return (
    <Pressable
      style={[styles.root, isDetail ? styles.rootDetail : null]}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_INSTAGRAM_POST_UI.OPEN_BUTTON_ARIA}
      hitSlop={6}
    >
      <MaterialIcons
        name="play-arrow"
        size={isDetail ? 20 : 16}
        color={theme.colors.onContrast}
      />
      <View style={[styles.igBadge, isDetail ? styles.igBadgeDetail : null]}>
        <MaterialIcons name="camera-alt" size={isDetail ? 10 : 8} color="#fff" />
      </View>
    </Pressable>
  );
};
