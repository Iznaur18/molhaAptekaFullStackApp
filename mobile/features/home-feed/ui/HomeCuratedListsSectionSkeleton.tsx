import { useMemo } from "react";
import { View } from "react-native";

import {
  CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX,
  resolveCuratedCompactCardWidth,
} from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { SkeletonShimmer } from "@/shared/ui/SkeletonShimmer";
import {
  useCuratedProductCompactCardStyles,
  useHomeCuratedListsStyles,
} from "@/shared/theme/catalogProductStyles";
import { useHomeFeedSkeletonStyles } from "@/shared/theme/homeFeedSkeletonStyles";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

/**
 * Плейсхолдер секции подборок на время загрузки. Использует стили и
 * layout-константы реальной секции, чтобы каталог под ней не сдвигался
 * после ответа API.
 */
export const HomeCuratedListsSectionSkeleton = () => {
  const styles = useHomeCuratedListsStyles();
  const cardStyles = useCuratedProductCompactCardStyles();
  const skeletonStyles = useHomeFeedSkeletonStyles();
  const { layoutWidth } = useScreenLayout();

  const compactCardWidth = useMemo(() => {
    const scrollContainerWidth = layoutWidth - SCREEN_CONTENT_PADDING_HORIZONTAL * 2;
    return resolveCuratedCompactCardWidth(scrollContainerWidth);
  }, [layoutWidth]);

  return (
    <SkeletonShimmer style={styles.listBlock}>
      <View style={skeletonStyles.curatedTitleLine} />
      <View style={[styles.row, { flexDirection: "row", overflow: "hidden" }]}>
        {Array.from({ length: CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX }, (_, index) => (
          <View key={index} style={[cardStyles.card, { width: compactCardWidth }]}>
            <View style={cardStyles.imageWrap} />
            <View style={[cardStyles.priceWrap, skeletonStyles.curatedPricePlaceholder]} />
          </View>
        ))}
      </View>
    </SkeletonShimmer>
  );
};
