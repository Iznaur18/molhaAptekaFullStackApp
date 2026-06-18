import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

import { CuratedProductCompactCard } from "@/entities/curated-product-list/ui/CuratedProductCompactCard";
import type { HomeCuratedProductList } from "@/entities/curated-product-list/api/fetchHomeCuratedProductLists";
import { resolveCuratedCompactCardWidth } from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { HOME_FEED_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useHomeCuratedListsStyles } from "@/shared/theme/catalogProductStyles";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

type HomeCuratedListsSectionProps = {
  lists: HomeCuratedProductList[];
};

export const HomeCuratedListsSection = ({ lists }: HomeCuratedListsSectionProps) => {
  const styles = useHomeCuratedListsStyles();
  const { layoutWidth } = useScreenLayout();

  const compactCardWidth = useMemo(() => {
    const scrollContainerWidth = layoutWidth - SCREEN_CONTENT_PADDING_HORIZONTAL * 2;
    return resolveCuratedCompactCardWidth(scrollContainerWidth);
  }, [layoutWidth]);

  if (lists.length === 0) {
    return null;
  }

  return (
    <View accessibilityLabel={HOME_FEED_UI.CURATED_SECTION_ARIA}>
      {lists.map((list) => (
        <View key={list._id} style={styles.listBlock}>
          <Text style={styles.title}>{list.title}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {list.products.map((product) => (
              <CuratedProductCompactCard
                key={product._id}
                product={product}
                width={compactCardWidth}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};
