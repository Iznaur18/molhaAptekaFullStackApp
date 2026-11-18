import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

import type {
  HomeCuratedCategory,
  HomeCuratedCategoryList,
} from "@/entities/curated-category-list/api/fetchHomeCuratedCategoryLists";
import { resolveCuratedCategoryCompactCardWidth } from "@/entities/curated-category-list/lib/curatedCategoryListHomeLayout";
import { CuratedCategoryCompactCard } from "@/entities/curated-category-list/ui/CuratedCategoryCompactCard";
import { CURATED_PRODUCT_LIST_HOME_SECTION_BORDER_RADIUS } from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { HOME_FEED_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useHomeCuratedListsStyles } from "@/shared/theme/catalogProductStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type HomeCuratedCategoryListsSectionProps = {
  lists: HomeCuratedCategoryList[];
  onOpenCategory: (category: HomeCuratedCategory) => void;
};

export const HomeCuratedCategoryListsSection = ({
  lists,
  onOpenCategory,
}: HomeCuratedCategoryListsSectionProps) => {
  const styles = useHomeCuratedListsStyles();
  const { layoutWidth, contentPaddingHorizontal } = useScreenLayout();

  const compactCardWidth = useMemo(() => {
    const scrollContainerWidth = layoutWidth - contentPaddingHorizontal * 2;
    return resolveCuratedCategoryCompactCardWidth(scrollContainerWidth);
  }, [contentPaddingHorizontal, layoutWidth]);

  if (lists.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.section}
      accessibilityLabel={HOME_FEED_UI.CURATED_CATEGORIES_SECTION_ARIA}
    >
      {lists.map((list) => (
        <View key={list._id} style={styles.listGroup}>
          <Text style={styles.title}>{list.title}</Text>
          <SquircleView
            radius={CURATED_PRODUCT_LIST_HOME_SECTION_BORDER_RADIUS}
            style={styles.listBlock}
          >
            <ScrollView
              horizontal
              {...nestedHorizontalScrollProps}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {list.categories.map((category) => (
                <CuratedCategoryCompactCard
                  key={category.itemKey}
                  category={category}
                  width={compactCardWidth}
                  onOpen={onOpenCategory}
                />
              ))}
            </ScrollView>
          </SquircleView>
        </View>
      ))}
    </View>
  );
};
