import { Text, View } from "react-native";

import { useProductCardOutOfStockOverlayStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardSellerClosedOverlayProps = {
  label: string;
};

export const ProductCardSellerClosedOverlay = ({ label }: ProductCardSellerClosedOverlayProps) => {
  const styles = useProductCardOutOfStockOverlayStyles();

  return (
    <View
      style={styles.overlay}
      pointerEvents="auto"
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};
