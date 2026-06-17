import { Pressable, View } from "react-native";

import type { ProductDetailTabId } from "@/entities/product/model/useProductDetailTabs";
import { useProductDetailTabBarStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

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
            <AppText style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};
