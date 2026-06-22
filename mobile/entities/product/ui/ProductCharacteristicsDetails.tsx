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
};

export const ProductCharacteristicsDetails = ({ items }: ProductCharacteristicsDetailsProps) => {
  const styles = useProductCharacteristicsDetailsStyles();
  const rows = getProductNonEmptyCharacteristics(items);

  if (rows.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.root}
      accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_SECTION_ARIA}
    >
      <Text style={styles.title}>{PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE}</Text>
      <View style={styles.list}>
        {rows.map((item) => (
          <View key={item.key} style={styles.row}>
            <Text style={styles.key}>{item.key}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
