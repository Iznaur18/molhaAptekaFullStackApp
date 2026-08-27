import { useWindowDimensions, Text, View } from "react-native";

import { PRODUCT_DETAILS_META_GRID_LAYOUT as MG } from "@/entities/product/lib/productDetailsMetaGridLayout";
import {
  getProductFieldLabel,
  getProductFieldReadLayout,
  isProductFieldMultilineRead,
} from "../lib/productFieldRegistry";
import {
  formatProductFieldForDisplay,
  PRODUCT_FIELD_EMPTY_DISPLAY,
} from "../lib/formatProductFieldForDisplay";
import { useProductDetailFieldStyles } from "@/shared/theme/catalogProductStyles";

import { ProductDetailIdCopyButton } from "./ProductDetailIdCopyButton";

const PRODUCT_ID_FIELD_KEY = "_id";

type ProductDetailFieldRowsProps = {
  product: Record<string, unknown>;
  fieldKeys: readonly string[];
  layout?: "grid" | "stack" | "meta";
};

export const ProductDetailFieldRows = ({
  product,
  fieldKeys,
  layout = "grid",
}: ProductDetailFieldRowsProps) => {
  const styles = useProductDetailFieldStyles();
  const { width: viewportWidth } = useWindowDimensions();
  const isMetaLayout = layout === "meta";
  const metaColumns =
    viewportWidth >= MG.narrowBreakpoint ? MG.columns : 1;

  const containerStyle = isMetaLayout
    ? [
        styles.metaGrid,
        metaColumns === MG.columns ? styles.metaGridThreeCol : styles.metaGridOneCol,
      ]
    : layout === "stack"
      ? styles.stack
      : styles.statsGrid;

  const metaCellStyle =
    metaColumns === MG.columns ? styles.metaGridCellThreeCol : styles.metaGridCellOneCol;

  return (
    <View style={containerStyle}>
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
        const isMultiline = isProductFieldMultilineRead(key);
        const clampStatValue = isStatRow && !isMultiline;
        const displayValue = formatProductFieldForDisplay(key, product);
        const showIdCopy =
          key === PRODUCT_ID_FIELD_KEY &&
          displayValue !== PRODUCT_FIELD_EMPTY_DISPLAY &&
          displayValue.length > 0;

        return (
          <View
            key={key}
            style={[
              rowStyle,
              isStatRow && isMultiline ? styles.rowStatMultiline : null,
              isMetaLayout ? metaCellStyle : null,
            ]}
          >
            <Text
              style={labelStyle}
              numberOfLines={isStatRow ? 1 : undefined}
              ellipsizeMode={isStatRow ? "tail" : undefined}
            >
              {getProductFieldLabel(key)}
            </Text>
            {showIdCopy ? (
              <View style={styles.metaValueRow}>
                <Text
                  style={[valueStyle, styles.metaValueText]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  selectable
                >
                  {displayValue}
                </Text>
                <ProductDetailIdCopyButton productId={displayValue} />
              </View>
            ) : (
              <Text
                style={valueStyle}
                numberOfLines={clampStatValue ? 1 : undefined}
                ellipsizeMode={clampStatValue ? "tail" : undefined}
              >
                {displayValue}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};
