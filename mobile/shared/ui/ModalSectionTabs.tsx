import { Pressable, Text, View } from "react-native";

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
  /** default — горизонтальный скролл; segment — equal-width pills в треке */
  variant?: "default" | "inHeader" | "segment";
};

export const ModalSectionTabs = ({
  tabs,
  activeTabId,
  onTabChange,
  ariaLabel,
  variant = "default",
}: ModalSectionTabsProps) => {
  const styles = useModalSectionTabsStyles();
  const isSegment = variant === "segment";

  const tabNodes = tabs.map((tab) => {
    const isActive = activeTabId === tab.id;

    return (
      <Pressable
        key={tab.id}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        style={({ pressed }) => [
          isSegment ? styles.segmentTab : styles.tab,
          isActive && (isSegment ? styles.segmentTabActive : styles.tabActive),
          pressed && !isActive && (isSegment ? styles.segmentTabPressed : styles.tabPressed),
        ]}
        onPress={() => onTabChange(tab.id)}
      >
        <Text
          style={[
            isSegment ? styles.segmentTabLabel : styles.tabLabel,
            isActive && (isSegment ? styles.segmentTabLabelActive : styles.tabLabelActive),
          ]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      </Pressable>
    );
  });

  if (isSegment) {
    return (
      <View
        style={styles.segmentTrack}
        accessibilityRole="tablist"
        accessibilityLabel={ariaLabel}
      >
        {tabNodes}
      </View>
    );
  }

  return (
    <View
      style={[styles.row, variant === "inHeader" && styles.rowInHeader]}
      accessibilityRole="tablist"
      accessibilityLabel={ariaLabel}
    >
      {tabNodes}
    </View>
  );
};
