import { Pressable, ScrollView, View } from "react-native";

import type { SiteHeaderBannerAdminTabId } from "@/features/site-header-banner-admin-page/lib/siteHeaderBannerAdminTabs";
import { useSiteHeaderBannerAdminTabBarStyles } from "@/shared/theme/siteHeaderBannerAdminPageStyles";
import { AppText } from "@/shared/ui/AppText";

type SiteHeaderBannerAdminTabBarProps = {
  tabs: { id: SiteHeaderBannerAdminTabId; label: string }[];
  activeTab: SiteHeaderBannerAdminTabId;
  onTabChange: (tabId: SiteHeaderBannerAdminTabId) => void;
};

export const SiteHeaderBannerAdminTabBar = ({
  tabs,
  activeTab,
  onTabChange,
}: SiteHeaderBannerAdminTabBarProps) => {
  const styles = useSiteHeaderBannerAdminTabBarStyles();

  return (
    <View style={styles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab.id)}
            >
              <AppText style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
