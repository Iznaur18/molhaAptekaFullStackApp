import { ScrollView, Pressable, Text, View } from "react-native";

import type { CategoryFilterChip } from "@/entities/product-category-display/lib/buildCategoryFilterChips";
import { CATALOG_FILTER_UI } from "@/shared/config";
import { useCatalogFilterChipStyles } from "@/shared/theme/catalogProductStyles";

type CatalogCategoryChipsProps = {
  chips: CategoryFilterChip[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
};

export const CatalogCategoryChips = ({
  chips,
  selectedSlug,
  onSelect,
}: CatalogCategoryChipsProps) => {
  const styles = useCatalogFilterChipStyles();

  if (chips.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Pressable
          style={[styles.chip, selectedSlug === null && styles.chipActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.chipText, selectedSlug === null && styles.chipTextActive]}>
            {CATALOG_FILTER_UI.ALL_CATEGORIES}
          </Text>
        </Pressable>
        {chips.map((chip) => {
          const isActive = selectedSlug === chip.slug;
          return (
            <Pressable
              key={chip.slug}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(chip.slug)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{chip.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
