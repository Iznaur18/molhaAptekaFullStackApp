import { Pressable, StyleSheet, Text, View } from "react-native";

import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABEL_RU } from "@/entities/product/lib/productCategoryLabels";

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
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  chipSelected: { borderColor: "#1f6feb", backgroundColor: "#e8f1ff" },
  chipText: { fontSize: 12, color: "#333" },
  chipTextSelected: { color: "#1f6feb", fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
