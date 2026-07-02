import { Pressable, ScrollView, Text, View } from "react-native";

import { useModalSectionTabsStyles } from "@/shared/theme/modalChromeStyles";

type ModalSectionTab = {
  id: string;
  label: string;
};

type ModalSectionTabsProps = {
  tabs: readonly ModalSectionTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  ariaLabel?: string;
  variant?: "default" | "inHeader";
};

export const ModalSectionTabs = ({
  tabs,
  activeTabId,
  onTabChange,
  ariaLabel,
  variant = "default",
}: ModalSectionTabsProps) => {
  const styles = useModalSectionTabsStyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.row,
        variant === "inHeader" && styles.rowInHeader,
      ]}
      accessibilityRole="tablist"
      accessibilityLabel={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && !isActive && styles.tabPressed,
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
