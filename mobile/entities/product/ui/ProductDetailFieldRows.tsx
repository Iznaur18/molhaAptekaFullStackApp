import { StyleSheet, Text, View } from "react-native";

import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay";
import { getProductFieldLabel } from "../lib/productFieldRegistry";

type ProductDetailFieldRowsProps = {
  product: Record<string, unknown>;
  fieldKeys: readonly string[];
};

export const ProductDetailFieldRows = ({ product, fieldKeys }: ProductDetailFieldRowsProps) => (
  <View style={styles.grid}>
    {fieldKeys.map((key) => (
      <View key={key} style={styles.row}>
        <Text style={styles.label}>{getProductFieldLabel(key)}</Text>
        <Text style={styles.value}>{formatProductFieldForDisplay(key, product)}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    gap: 10,
  },
  row: {
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 15,
    color: "#222",
    lineHeight: 22,
  },
});
