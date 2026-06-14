import { Pressable, Text, View } from "react-native";

import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABEL_RU } from "@/entities/product/lib/productCategoryLabels";
import { useStaffFilterChipStyles } from "@/shared/theme/staffQueueStyles";

type SynonymCategoryPickerProps = {
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export const SynonymCategoryPicker = ({
  selected,
  onChange,
  disabled = false,
}: SynonymCategoryPickerProps) => {
  const styles = useStaffFilterChipStyles();

  const toggleSlug = (slug: string) => {
    if (disabled) {
      return;
    }
    if (selected.includes(slug)) {
      onChange(selected.filter((item) => item !== slug));
      return;
    }
    onChange([...selected, slug]);
  };

  return (
    <View style={styles.wrap}>
      {PRODUCT_CATEGORIES.map((slug) => {
        const isSelected = selected.includes(slug);
        return (
          <Pressable
            key={slug}
            style={[styles.chip, isSelected && styles.chipSelected, disabled && styles.disabled]}
            onPress={() => toggleSlug(slug)}
            disabled={disabled}
          >
            <Text style={[styles.chipTextSmall, isSelected && styles.chipTextSelected]}>
              {PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
