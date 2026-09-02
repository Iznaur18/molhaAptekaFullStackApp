import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { PRODUCT_SELLER_PREVIEW_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailsSellerStorefrontButtonStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsSellerStorefrontButtonProps = {
  sellerId: string;
  embedded?: boolean;
};

export const ProductDetailsSellerStorefrontButton = ({
  sellerId,
  embedded = false,
}: ProductDetailsSellerStorefrontButtonProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useProductDetailsSellerStorefrontButtonStyles();
  const id = String(sellerId ?? "").trim();

  if (!id) {
    return null;
  }

  const handlePress = () => {
    router.push(`/seller/${encodeURIComponent(id)}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.root,
        embedded && styles.rootEmbedded,
        pressed ? styles.rootPressed : null,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_SELLER_PREVIEW_UI.SELLER_STOREFRONT_ARIA}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="storefront" size={20} color={theme.colors.action} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{PRODUCT_SELLER_PREVIEW_UI.SELLER_STOREFRONT_BUTTON}</Text>
        <Text style={styles.hint}>{PRODUCT_SELLER_PREVIEW_UI.SELLER_STOREFRONT_HINT}</Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={22}
        color={theme.colors.action}
        style={styles.chevron}
      />
    </Pressable>
  );
};
