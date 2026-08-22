import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PopularProductsAdminCategoriesTab } from "@/features/popular-products-admin-page/ui/PopularProductsAdminCategoriesTab";
import { PopularProductsAdminProductsTab } from "@/features/popular-products-admin-page/ui/PopularProductsAdminProductsTab";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PROFILE_PAGE_UI, POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "@/shared/config";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";

type AdminTab = "products" | "categories";

export const PopularProductsAdminPage = () => {
  const router = useRouter();
  const styles = useAdminPanelStyles();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  const renderTabChip = (value: AdminTab, label: string) => {
    const active = activeTab === value;
    return (
      <Pressable
        style={[styles.toolbarButton, active && styles.toolbarButtonPrimary]}
        onPress={() => setActiveTab(value)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
      >
        <Text style={[styles.toolbarButtonText, active && styles.toolbarButtonPrimaryText]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const topSlot = (
    <View style={{ gap: 8 }}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_POPULAR_PRODUCTS_ADMIN}
        onPress={() => setNavSheetVisible(true)}
      />
      <View style={styles.toolbarActions} accessibilityRole="tablist">
        {renderTabChip("products", POPULAR_CATEGORIES_ADMIN_PAGE_UI.TAB_PRODUCTS)}
        {renderTabChip("categories", POPULAR_CATEGORIES_ADMIN_PAGE_UI.TAB_CATEGORIES)}
      </View>
    </View>
  );

  return (
    <>
      {activeTab === "products" ? (
        <PopularProductsAdminProductsTab topSlot={topSlot} />
      ) : (
        <PopularProductsAdminCategoriesTab topSlot={topSlot} />
      )}
      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="popular-products-admin"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
