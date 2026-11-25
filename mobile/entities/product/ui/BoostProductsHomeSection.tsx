import ArrowRight from "lucide-react-native/icons/arrow-right";
import Zap from "lucide-react-native/icons/zap";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { CuratedListViewAllSheet } from "@/entities/curated-product-list/ui/CuratedListViewAllSheet";
import type { BoostHomeProduct } from "@/entities/product/api/fetchProductPromotionBoostProducts";
import {
  BOOST_HOME_ICON_GLYPH,
  BOOST_HOME_VIEW_ALL_ICON,
  resolveBoostHomeCardHeight,
  resolveBoostHomeCardWidth,
} from "@/entities/product/lib/boostProductsHomeLayout";
import { BoostProductMiniCard } from "@/entities/product/ui/BoostProductMiniCard";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useBoostProductsHomeSectionStyles } from "@/shared/theme/boostProductsHomeStyles";
import { HorizontalOverflowRow } from "@/shared/ui/HorizontalOverflowRow";

type BoostProductsHomeSectionProps = {
  products: BoostHomeProduct[];
};

export const BoostProductsHomeSection = ({
  products,
}: BoostProductsHomeSectionProps) => {
  const styles = useBoostProductsHomeSectionStyles();
  const theme = useAppTheme();
  const { layoutWidth, contentPaddingHorizontal } = useScreenLayout();
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  const cardWidth = useMemo(() => {
    const scrollContainerWidth = layoutWidth - contentPaddingHorizontal * 2;
    return resolveBoostHomeCardWidth(scrollContainerWidth);
  }, [contentPaddingHorizontal, layoutWidth]);

  const trackHeight = useMemo(() => resolveBoostHomeCardHeight(cardWidth), [cardWidth]);

  if (products.length === 0) {
    return null;
  }

  const title = HOME_PAGE_UI.CATALOG_HOME_SECTION_BOOST_PRODUCTS;

  return (
    <>
      <View style={styles.section} accessibilityLabel={title}>
        <View style={styles.header}>
          <View style={styles.icon} accessibilityElementsHidden>
            <Zap size={BOOST_HOME_ICON_GLYPH} color={theme.colors.action} />
          </View>
          <View style={styles.headings}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {HOME_PAGE_UI.CATALOG_HOME_SECTION_BOOST_PRODUCTS_SUBTITLE}
            </Text>
          </View>
          <Pressable
            style={styles.viewAll}
            onPress={() => setIsViewAllOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={
              HOME_PAGE_UI.CATALOG_HOME_SECTION_BOOST_PRODUCTS_VIEW_ALL
            }
          >
            <Text style={styles.viewAllLabel}>
              {HOME_PAGE_UI.CATALOG_HOME_SECTION_BOOST_PRODUCTS_VIEW_ALL}
            </Text>
            <ArrowRight size={BOOST_HOME_VIEW_ALL_ICON} color={theme.colors.action} />
          </Pressable>
        </View>
        <HorizontalOverflowRow height={trackHeight} trackStyle={styles.row}>
          {products.map((product) => (
            <BoostProductMiniCard
              key={product._id}
              product={product}
              width={cardWidth}
            />
          ))}
        </HorizontalOverflowRow>
      </View>

      <CuratedListViewAllSheet
        isOpen={isViewAllOpen}
        title={title}
        products={products}
        onClose={() => setIsViewAllOpen(false)}
      />
    </>
  );
};
