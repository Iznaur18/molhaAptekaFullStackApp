import { Pressable, ScrollView, Text, View } from "react-native";

import { CATALOG_FILTER_UI } from "@/shared/config";
import {
  useCatalogSearchBarStyles,
  useCatalogSubcategoryChipStyles,
} from "@/shared/theme/catalogProductStyles";

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
  const styles = useCatalogSubcategoryChipStyles();

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
