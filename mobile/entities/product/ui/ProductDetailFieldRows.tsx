import { Text, View } from "react-native";

import {
  getProductFieldLabel,
  getProductFieldReadLayout,
  isProductFieldMultilineRead,
} from "../lib/productFieldRegistry";
import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay";
import { useProductDetailFieldStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailFieldRowsProps = {
  product: Record<string, unknown>;
  fieldKeys: readonly string[];
  layout?: "grid" | "stack";
};

export const ProductDetailFieldRows = ({
  product,
  fieldKeys,
  layout = "grid",
}: ProductDetailFieldRowsProps) => {
  const styles = useProductDetailFieldStyles();

  return (
    <View style={layout === "grid" ? styles.statsGrid : styles.stack}>
      {fieldKeys.map((key) => {
        const readLayout = getProductFieldReadLayout(key);
        const rowStyle =
          readLayout === "stat"
            ? styles.rowStat
            : readLayout === "block"
              ? styles.rowBlock
              : readLayout === "meta"
                ? styles.rowMeta
                : styles.rowDefault;
        const labelStyle =
          readLayout === "stat"
            ? styles.keyStat
            : readLayout === "block"
              ? styles.keyBlock
              : readLayout === "meta"
                ? styles.keyMeta
                : styles.label;
        const valueStyle = [
          readLayout === "stat"
            ? styles.valueStat
            : readLayout === "block"
              ? styles.valueBlock
              : readLayout === "meta"
                ? styles.valueMeta
                : styles.value,
          isProductFieldMultilineRead(key) && styles.valueMultiline,
        ];

        const isStatRow = readLayout === "stat";
        const displayValue = formatProductFieldForDisplay(key, product);

        return (
          <View key={key} style={rowStyle}>
            <Text
              style={labelStyle}
              numberOfLines={isStatRow ? 1 : undefined}
              ellipsizeMode={isStatRow ? "tail" : undefined}
            >
              {getProductFieldLabel(key)}
            </Text>
            <Text
              style={valueStyle}
              numberOfLines={isStatRow ? 1 : undefined}
              ellipsizeMode={isStatRow ? "tail" : undefined}
            >
              {displayValue}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
