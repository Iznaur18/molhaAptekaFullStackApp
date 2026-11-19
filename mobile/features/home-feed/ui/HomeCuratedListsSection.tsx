import { useMemo } from "react";
import { Text, View } from "react-native";

import { CuratedProductCompactCard } from "@/entities/curated-product-list/ui/CuratedProductCompactCard";
import type { HomeCuratedProductList } from "@/entities/curated-product-list/api/fetchHomeCuratedProductLists";
import {
  CURATED_PRODUCT_LIST_HOME_SECTION_BORDER_RADIUS,
  resolveCuratedCompactCardHeight,
  resolveCuratedCompactCardWidth,
} from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { HOME_FEED_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useHomeCuratedListsStyles } from "@/shared/theme/catalogProductStyles";
import { HorizontalOverflowRow } from "@/shared/ui/HorizontalOverflowRow";
import { SquircleView } from "@/shared/ui/SquircleView";

type HomeCuratedListsSectionProps = {
  lists: HomeCuratedProductList[];
};

export const HomeCuratedListsSection = ({ lists }: HomeCuratedListsSectionProps) => {
  const styles = useHomeCuratedListsStyles();
  const { layoutWidth, contentPaddingHorizontal } = useScreenLayout();

  const compactCardWidth = useMemo(() => {
    const scrollContainerWidth = layoutWidth - contentPaddingHorizontal * 2;
    return resolveCuratedCompactCardWidth(scrollContainerWidth);
  }, [contentPaddingHorizontal, layoutWidth]);

  const trackHeight = useMemo(
    () => resolveCuratedCompactCardHeight(compactCardWidth),
    [compactCardWidth],
  );

  if (lists.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} accessibilityLabel={HOME_FEED_UI.CURATED_SECTION_ARIA}>
      {lists.map((list) => (
        <View key={list._id} style={styles.listGroup}>
          <Text style={styles.title}>{list.title}</Text>
          <SquircleView
            radius={CURATED_PRODUCT_LIST_HOME_SECTION_BORDER_RADIUS}
            style={styles.listBlock}
          >
            <HorizontalOverflowRow height={trackHeight} trackStyle={styles.row}>
              {list.products.map((product) => (
                <CuratedProductCompactCard
                  key={product._id}
                  product={product}
                  width={compactCardWidth}
                />
              ))}
            </HorizontalOverflowRow>
          </SquircleView>
        </View>
      ))}
    </View>
  );
};
