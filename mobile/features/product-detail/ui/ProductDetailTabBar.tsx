import { Pressable, Text, View } from "react-native";

import type { ProductDetailTabId } from "@/entities/product/model/useProductDetailTabs";
import { useProductDetailTabBarStyles } from "@/shared/theme/catalogProductStyles";

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

  if (tabs.length <= 1) {
    return null;
  }

  return (
    <View style={styles.root}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.id)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
