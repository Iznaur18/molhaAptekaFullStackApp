import { Text, View } from "react-native";

import { resolveProductOutOfStockOverlayLabel } from "@/entities/product/lib/resolveProductOutOfStockOverlayLabel";
import { useProductCardOutOfStockOverlayStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardOutOfStockOverlayProps = {
  product: Record<string, unknown>;
};

export const ProductCardOutOfStockOverlay = ({ product }: ProductCardOutOfStockOverlayProps) => {
  const styles = useProductCardOutOfStockOverlayStyles();
  const label = resolveProductOutOfStockOverlayLabel(product);

  return (
    <View
      style={styles.overlay}
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};
