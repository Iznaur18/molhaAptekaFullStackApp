import ArrowRight from "lucide-react-native/icons/arrow-right";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import type {
  HomeCuratedCategory,
  HomeCuratedCategoryList,
} from "@/entities/curated-category-list/api/fetchHomeCuratedCategoryLists";
import {
  CURATED_CATEGORY_LIST_HOME_CAROUSEL_IMAGE_ASPECT,
  resolveCuratedCategoryCompactCardHeight,
  resolveCuratedCategoryCompactCardWidth,
} from "@/entities/curated-category-list/lib/curatedCategoryListHomeLayout";
import { CuratedCategoryCompactCard } from "@/entities/curated-category-list/ui/CuratedCategoryCompactCard";
import { CURATED_LIST_VIEW_ALL_BUTTON } from "@/entities/curated-product-list/lib/curatedListViewAllSheetLayout";
import { CURATED_PRODUCT_LIST_HOME_SECTION_BORDER_RADIUS } from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { CuratedListViewAllSheet } from "@/entities/curated-product-list/ui/CuratedListViewAllSheet";
import { CURATED_LIST_CAROUSEL_UI, HOME_FEED_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useHomeCuratedListsStyles } from "@/shared/theme/catalogProductStyles";
import { useCuratedListCarouselHeaderStyles } from "@/shared/theme/curatedListViewAllSheetStyles";
import { HorizontalOverflowRow } from "@/shared/ui/HorizontalOverflowRow";
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
  const headerStyles = useCuratedListCarouselHeaderStyles();
  const theme = useAppTheme();
  const { layoutWidth, contentPaddingHorizontal } = useScreenLayout();
  const [openListId, setOpenListId] = useState<string | null>(null);

  const compactCardWidth = useMemo(() => {
    const scrollContainerWidth = layoutWidth - contentPaddingHorizontal * 2;
    return resolveCuratedCategoryCompactCardWidth(scrollContainerWidth);
  }, [contentPaddingHorizontal, layoutWidth]);

  const trackHeight = useMemo(
    () => resolveCuratedCategoryCompactCardHeight(compactCardWidth),
    [compactCardWidth],
  );

  const openList = useMemo(
    () => lists.find((list) => list._id === openListId) ?? null,
    [lists, openListId],
  );

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
          <SquircleView
            radius={CURATED_PRODUCT_LIST_HOME_SECTION_BORDER_RADIUS}
            style={styles.listBlock}
          >
            <View style={headerStyles.header}>
              <Text style={[styles.title, headerStyles.title]} numberOfLines={1}>
                {list.title}
              </Text>
              <Pressable
                style={headerStyles.viewAll}
                onPress={() => setOpenListId(list._id)}
                accessibilityRole="button"
                accessibilityLabel={CURATED_LIST_CAROUSEL_UI.VIEW_ALL_ARIA(list.title)}
              >
                <Text style={headerStyles.viewAllLabel}>
                  {CURATED_LIST_CAROUSEL_UI.VIEW_ALL}
                </Text>
                <ArrowRight
                  size={CURATED_LIST_VIEW_ALL_BUTTON.iconSize}
                  strokeWidth={CURATED_LIST_VIEW_ALL_BUTTON.iconStrokeWidth}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>
            <HorizontalOverflowRow height={trackHeight} trackStyle={styles.row}>
              {list.categories.map((category) => (
                <CuratedCategoryCompactCard
                  key={category.itemKey}
                  category={category}
                  width={compactCardWidth}
                  imageAspectRatio={CURATED_CATEGORY_LIST_HOME_CAROUSEL_IMAGE_ASPECT}
                  onOpen={onOpenCategory}
                />
              ))}
            </HorizontalOverflowRow>
          </SquircleView>
        </View>
      ))}

      <CuratedListViewAllSheet
        isOpen={openList != null}
        title={openList?.title ?? ""}
        categories={openList?.categories ?? []}
        onOpenCategory={onOpenCategory}
        onClose={() => setOpenListId(null)}
      />
    </View>
  );
};
