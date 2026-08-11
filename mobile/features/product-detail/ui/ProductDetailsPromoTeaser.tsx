import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { PRODUCT_PROMO_CODE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProductDetailsPromoTeaserProps = {
  product: Record<string, unknown>;
  onPress: () => void;
};

export const ProductDetailsPromoTeaser = ({
  product,
  onPress,
}: ProductDetailsPromoTeaserProps) => {
  const theme = useAppTheme();
  if (product.productHasActivePromoCodes !== true) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_ARIA}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <MaterialIcons name="local-offer" size={22} color={theme.colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
          {PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_TITLE}
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>
          {PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_SUBTITLE}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={theme.colors.textMuted} />
    </Pressable>
  );
};
