import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { CATALOG_FILTER_UI } from "@/shared/config";

type SubcategoryChip = {
  id: string;
  label: string;
};

type CatalogSubcategoryChipsProps = {
  subcategories: SubcategoryChip[];
  selectedSubcategoryId: string | null;
  onSelect: (subcategoryId: string | null) => void;
};

export const CatalogSubcategoryChips = ({
  subcategories,
  selectedSubcategoryId,
  onSelect,
}: CatalogSubcategoryChipsProps) => {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Pressable
          style={[styles.chip, selectedSubcategoryId === null && styles.chipActive]}
          onPress={() => onSelect(null)}
        >
          <Text
            style={[styles.chipText, selectedSubcategoryId === null && styles.chipTextActive]}
          >
            {CATALOG_FILTER_UI.ALL_IN_CATEGORY}
          </Text>
        </Pressable>
        {subcategories.map((chip) => {
          const isActive = selectedSubcategoryId === chip.id;
          return (
            <Pressable
              key={chip.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(chip.id)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{chip.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  row: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f7f7f7",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  chipActive: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  chipText: {
    fontSize: 13,
    color: "#444",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
