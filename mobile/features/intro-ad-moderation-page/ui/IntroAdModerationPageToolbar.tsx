import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import {
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
} from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";

const SECTION_FILTER_OPTIONS = [
  { value: "", label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_ALL },
  { value: INTRO_AD_MODERATION_SECTION_INTRO, label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_INTRO },
  { value: INTRO_AD_MODERATION_SECTION_BANNER, label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_BANNER },
  {
    value: INTRO_AD_MODERATION_SECTION_PERSONAL,
    label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_PERSONAL,
  },
];

type IntroAdModerationPageToolbarProps = {
  summaryCountLabel: string;
  sectionFilter: string;
  onSectionFilterChange: (value: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export const IntroAdModerationPageToolbar = ({
  summaryCountLabel,
  sectionFilter,
  onSectionFilterChange,
  isRefreshing,
  onRefresh,
}: IntroAdModerationPageToolbarProps) => {
  const styles = useIntroAdModerationPageStyles();

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{INTRO_AD_MODERATION_PAGE_UI.TITLE}</Text>
        <View style={styles.toolbarMeta}>
          <Text style={styles.queueCount}>{summaryCountLabel}</Text>
          <Pressable
            style={styles.refreshButton}
            accessibilityRole="button"
            disabled={isRefreshing}
            onPress={onRefresh}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.refreshText}>{INTRO_AD_MODERATION_PAGE_UI.REFRESH}</Text>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionChips}
        accessibilityRole="tablist"
        accessibilityLabel={INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_LABEL}
      >
        {SECTION_FILTER_OPTIONS.map((option) => {
          const isActive = sectionFilter === option.value;

          return (
            <Pressable
              key={option.value || "all"}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[styles.sectionChip, isActive ? styles.sectionChipActive : null]}
              onPress={() => onSectionFilterChange(option.value)}
            >
              <Text style={[styles.sectionChipText, isActive ? styles.sectionChipTextActive : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
