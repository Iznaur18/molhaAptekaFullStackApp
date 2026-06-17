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

const resolveCharacteristicKey = (item: CharacteristicItem): string =>
  item.key?.trim() || item.name?.trim() || "";

export const ProductCharacteristicsDetails = ({ items }: ProductCharacteristicsDetailsProps) => {
  const styles = useProductCharacteristicsDetailsStyles();
  const rows = Array.isArray(items)
    ? items.filter((item) => resolveCharacteristicKey(item) && item.value?.trim())
    : [];

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
        {rows.map((item) => {
          const key = resolveCharacteristicKey(item);
          return (
            <View key={key} style={styles.row}>
              <Text style={styles.key}>{key}</Text>
              <Text style={styles.value}>{item.value?.trim()}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
