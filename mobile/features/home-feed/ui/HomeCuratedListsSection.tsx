import { ScrollView, Text, View } from "react-native";

import type { HomeCuratedProductList } from "@/entities/curated-product-list/api/fetchHomeCuratedProductLists";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { HOME_FEED_UI } from "@/shared/config";
import { useHomeCuratedListsStyles } from "@/shared/theme/catalogProductStyles";

type HomeCuratedListsSectionProps = {
  lists: HomeCuratedProductList[];
};

export const HomeCuratedListsSection = ({ lists }: HomeCuratedListsSectionProps) => {
  const styles = useHomeCuratedListsStyles();

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
              <View key={product._id} style={styles.cardWrap}>
                <ProductCard product={product} />
              </View>
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};
