import { Pressable, Text, View } from "react-native";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "@/entities/product/lib/productCategoryLabels";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "@/shared/config";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";

type CategoryTreeLegacyPickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const CategoryTreeLegacyPicker = ({
  value,
  onChange,
  disabled = false,
}: CategoryTreeLegacyPickerProps) => {
  const styles = useAdminPanelStyles();

  return (
    <View style={styles.pickerWrap}>
      <Pressable
        style={[styles.pickerChip, value === "" && styles.pickerChipSelected]}
        disabled={disabled}
        onPress={() => onChange("")}
      >
        <Text style={styles.pickerChipText}>{CATEGORY_TREE_ADMIN_PAGE_UI.LEGACY_NONE}</Text>
      </Pressable>
      {PRODUCT_CATEGORIES.map((slug) => (
        <Pressable
          key={slug}
          style={[styles.pickerChip, value === slug && styles.pickerChipSelected]}
          disabled={disabled}
          onPress={() => onChange(slug)}
        >
          <Text style={styles.pickerChipText}>
            {PRODUCT_CATEGORY_LABEL_RU[slug as keyof typeof PRODUCT_CATEGORY_LABEL_RU] ?? slug}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
