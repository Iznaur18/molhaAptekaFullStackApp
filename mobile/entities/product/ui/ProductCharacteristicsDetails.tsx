import { getProductNonEmptyCharacteristics } from "@izibuy/shared-lib";
import { Text, View } from "react-native";

import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { useProductCharacteristicsDetailsStyles } from "@/shared/theme/catalogProductStyles";

type CharacteristicItem = {
  key?: string;
  name?: string;
  value?: string;
};

type ProductCharacteristicsDetailsProps = {
  items?: CharacteristicItem[] | null;
  showTitle?: boolean;
  embedded?: boolean;
  title?: string;
  accessibilityLabel?: string;
};

export const ProductCharacteristicsDetails = ({
  items,
  showTitle = true,
  embedded = false,
  title = PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE,
  accessibilityLabel = PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_SECTION_ARIA,
}: ProductCharacteristicsDetailsProps) => {
  const styles = useProductCharacteristicsDetailsStyles();
  const rows = getProductNonEmptyCharacteristics(items);

  if (rows.length === 0) {
    return null;
  }

  return (
    <View
      style={embedded ? styles.rootEmbedded : styles.root}
      accessibilityLabel={accessibilityLabel}
    >
      {showTitle ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.list}>
        {rows.map((item, index) => (
          <View
            key={item.key}
            style={[styles.row, index === rows.length - 1 ? styles.rowLast : null]}
          >
            <View style={styles.keyCell}>
              <Text style={styles.key}>{item.key}</Text>
            </View>
            <View style={styles.valueCell}>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
