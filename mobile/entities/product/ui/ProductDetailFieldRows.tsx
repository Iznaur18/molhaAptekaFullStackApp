import { Text, View } from "react-native";

import { useProductDetailFieldStyles } from "@/shared/theme/catalogProductStyles";

import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay";
import { getProductFieldLabel } from "../lib/productFieldRegistry";

type ProductDetailFieldRowsProps = {
  product: Record<string, unknown>;
  fieldKeys: readonly string[];
};

export const ProductDetailFieldRows = ({ product, fieldKeys }: ProductDetailFieldRowsProps) => {
  const styles = useProductDetailFieldStyles();

  return (
    <View style={styles.grid}>
      {fieldKeys.map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{getProductFieldLabel(key)}</Text>
          <Text style={styles.value}>{formatProductFieldForDisplay(key, product)}</Text>
        </View>
      ))}
    </View>
  );
};
