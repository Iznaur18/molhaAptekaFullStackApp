import { Pressable, Text, View } from "react-native";

import { PRODUCT_REPORTS_PAGE_UI } from "@/shared/config";
import { useProductReportsPageStyles } from "@/shared/theme/productReportsPageStyles";

type SectionFilter = "" | "products" | "stories";

type ProductReportsToolbarProps = {
  sectionFilter: SectionFilter;
  onSectionFilterChange: (value: SectionFilter) => void;
  groupsCount: number;
};

const SECTION_FILTER_OPTIONS: Array<{ value: SectionFilter; label: string }> = [
  { value: "", label: PRODUCT_REPORTS_PAGE_UI.SECTION_FILTER_ALL },
  { value: "products", label: PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS },
  { value: "stories", label: PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES },
];

export const ProductReportsToolbar = ({
  sectionFilter,
  onSectionFilterChange,
  groupsCount,
}: ProductReportsToolbarProps) => {
  const styles = useProductReportsPageStyles();

  return (
    <View
      style={styles.toolbar}
      accessibilityRole="none"
      accessibilityLabel={PRODUCT_REPORTS_PAGE_UI.SECTION_FILTER_LABEL}
    >
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarCount}>{PRODUCT_REPORTS_PAGE_UI.COUNT(groupsCount)}</Text>
      </View>

      <View style={styles.chips} accessibilityRole="tablist">
        {SECTION_FILTER_OPTIONS.map((option) => {
          const isActive = sectionFilter === option.value;

          return (
            <Pressable
              key={option.value || "all"}
              style={[styles.chip, isActive && styles.chipActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onSectionFilterChange(option.value)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
