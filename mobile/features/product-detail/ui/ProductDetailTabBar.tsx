import { Pressable, ScrollView, View } from "react-native";

import type { ProductDetailTabId } from "@/entities/product/model/useProductDetailTabs";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import {
  PRODUCT_DETAIL_TAB_BAR_TABLET_RADIUS,
  useProductDetailTabBarStyles,
} from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";
import { SquircleView } from "@/shared/ui/SquircleView";

type ProductDetailTabBarProps = {
  tabs: { id: ProductDetailTabId; label: string }[];
  activeTab: ProductDetailTabId;
  onTabChange: (tab: ProductDetailTabId) => void;
};

export const ProductDetailTabBar = ({
  tabs,
  activeTab,
  onTabChange,
}: ProductDetailTabBarProps) => {
  const styles = useProductDetailTabBarStyles();
  const { isTablet } = useScreenLayout();

  if (tabs.length <= 1) {
    return null;
  }

  const tabButtons = tabs.map((tab) => {
    const isActive = tab.id === activeTab;
    return (
      <Pressable
        key={tab.id}
        style={[styles.tab, isTablet && styles.tabTablet, isActive && styles.tabActive]}
        onPress={() => onTabChange(tab.id)}
      >
        <AppText style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</AppText>
      </Pressable>
    );
  });

  if (isTablet) {
    return (
      <SquircleView radius={PRODUCT_DETAIL_TAB_BAR_TABLET_RADIUS} style={styles.rootTablet}>
        <View style={styles.rowTablet}>{tabButtons}</View>
      </SquircleView>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabButtons}
      </ScrollView>
    </View>
  );
};
