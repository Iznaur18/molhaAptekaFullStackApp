import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import {
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
  INTRO_AD_MODERATION_SECTION_RAFFLE,
  INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
} from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { resolveIntroAdModerationSectionChipStyles } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionZone";
import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";

const buildSectionFilterOptions = (showUsersRaffleSection: boolean) => {
  const options: Array<{ value: string; label: string }> = [
    { value: "", label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_ALL },
    { value: INTRO_AD_MODERATION_SECTION_INTRO, label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_INTRO },
    { value: INTRO_AD_MODERATION_SECTION_BANNER, label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_BANNER },
    {
      value: INTRO_AD_MODERATION_SECTION_PERSONAL,
      label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_PERSONAL,
    },
    {
      value: INTRO_AD_MODERATION_SECTION_RAFFLE,
      label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_RAFFLE,
    },
  ];

  if (showUsersRaffleSection) {
    options.push({
      value: INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
      label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_USERS_RAFFLE,
    });
  }

  return options;
};

type IntroAdModerationPageToolbarProps = {
  summaryCountLabel: string;
  sectionFilter: string;
  onSectionFilterChange: (value: string) => void;
  showUsersRaffleSection?: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export const IntroAdModerationPageToolbar = ({
  summaryCountLabel,
  sectionFilter,
  onSectionFilterChange,
  showUsersRaffleSection = false,
  isRefreshing,
  onRefresh,
}: IntroAdModerationPageToolbarProps) => {
  const styles = useIntroAdModerationPageStyles();
  const sectionFilterOptions = buildSectionFilterOptions(showUsersRaffleSection);

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
        {sectionFilterOptions.map((option) => {
          const isActive = sectionFilter === option.value;
          const chipStyles = resolveIntroAdModerationSectionChipStyles(option.value, isActive, styles);

          return (
            <Pressable
              key={option.value || "all"}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={chipStyles.chip}
              onPress={() => onSectionFilterChange(option.value)}
            >
              <Text style={chipStyles.text}>{option.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
