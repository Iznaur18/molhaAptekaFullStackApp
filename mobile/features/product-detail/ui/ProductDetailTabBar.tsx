import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ProductDetailTabId } from "@/entities/product/model/useProductDetailTabs";

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

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f4f4f5",
  },
  tabActive: {
    backgroundColor: "#111",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  tabTextActive: {
    color: "#fff",
  },
});
