import { Pressable, Text, View } from "react-native";

import type { HomeFeedSectionTab } from "@/features/home-feed/model/homeFeedSectionTab";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { useHomeFeedSectionTabStyles } from "@/shared/theme/homeFeedSectionTabStyles";

const TABS: { id: HomeFeedSectionTab; label: string }[] = [
  { id: "home", label: HOME_PAGE_UI.CATALOG_HOME_SECTION },
  { id: "sellers", label: HOME_PAGE_UI.CATALOG_HOME_SECTION_SELLERS },
  { id: "categories", label: HOME_PAGE_UI.CATALOG_HOME_SECTION_CATEGORIES },
];

type HomeFeedSectionTabsProps = {
  active: HomeFeedSectionTab;
  onChange: (tab: HomeFeedSectionTab) => void;
};

export const HomeFeedSectionTabs = ({ active, onChange }: HomeFeedSectionTabsProps) => {
  const styles = useHomeFeedSectionTabStyles();

  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const pressed = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityState={{ selected: pressed }}
            onPress={() => onChange(tab.id)}
            style={[styles.tab, pressed && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, pressed && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
