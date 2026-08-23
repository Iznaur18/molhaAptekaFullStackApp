import { Text, View } from "react-native";

import { resolveProductOutOfStockOverlayLabel } from "@/entities/product/lib/resolveProductOutOfStockOverlayLabel";
import { useProductCardOutOfStockOverlayStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardOutOfStockOverlayProps = {
  product: Record<string, unknown>;
};

export const ProductCardOutOfStockOverlay = ({ product }: ProductCardOutOfStockOverlayProps) => {
  const styles = useProductCardOutOfStockOverlayStyles();

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Text style={styles.label}>{resolveProductOutOfStockOverlayLabel(product)}</Text>
    </View>
  );
};
