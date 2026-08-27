import { useCallback } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  UIManager,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { ProductDetailTabId } from "@/entities/product/model/useProductDetailTabs";
import { PRODUCT_DETAIL_TAB_BAR_LAYOUT } from "@/shared/lib/productDetailTabBarLayout";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useProductDetailTabBarStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ProductDetailTabBarLayout = "default" | "wide";

type ProductDetailTabBarProps = {
  tabs: { id: ProductDetailTabId; label: string }[];
  activeTab: ProductDetailTabId;
  onTabChange: (tab: ProductDetailTabId) => void;
  layout?: ProductDetailTabBarLayout;
};

type ProductDetailTabButtonProps = {
  tab: { id: ProductDetailTabId; label: string };
  isActive: boolean;
  onPress: () => void;
  styles: ReturnType<typeof useProductDetailTabBarStyles>;
};

const ProductDetailTabButton = ({
  tab,
  isActive,
  onPress,
  styles,
}: ProductDetailTabButtonProps) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(PRODUCT_DETAIL_TAB_BAR_LAYOUT.pressScale, {
      damping: PRODUCT_DETAIL_TAB_BAR_LAYOUT.springDamping,
      stiffness: PRODUCT_DETAIL_TAB_BAR_LAYOUT.springStiffness,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: PRODUCT_DETAIL_TAB_BAR_LAYOUT.springDamping,
      stiffness: PRODUCT_DETAIL_TAB_BAR_LAYOUT.springStiffness,
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.tab,
          isActive && styles.tabActive,
          !isActive && pressed && styles.tabPressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        <AppText style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</AppText>
      </Pressable>
    </Animated.View>
  );
};

export const ProductDetailTabBar = ({
  tabs,
  activeTab,
  onTabChange,
  layout = "default",
}: ProductDetailTabBarProps) => {
  const styles = useProductDetailTabBarStyles();

  const handleTabChange = useCallback(
    (tabId: ProductDetailTabId) => {
      if (tabId === activeTab) {
        return;
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onTabChange(tabId);
    },
    [activeTab, onTabChange],
  );

  if (tabs.length <= 1) {
    return null;
  }

  const tabButtons = tabs.map((tab) => (
    <ProductDetailTabButton
      key={tab.id}
      tab={tab}
      isActive={tab.id === activeTab}
      onPress={() => handleTabChange(tab.id)}
      styles={styles}
    />
  ));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.root, layout === "wide" && styles.rootWide]}
      contentContainerStyle={[
        styles.scrollContent,
        layout === "wide" && styles.scrollContentWide,
      ]}
      {...nestedHorizontalScrollProps}
      keyboardShouldPersistTaps="handled"
    >
      {tabButtons}
    </ScrollView>
  );
};
