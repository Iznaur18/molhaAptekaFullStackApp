import { Pressable, Text, View } from "react-native";

import {
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
  INTRO_AD_MODERATION_SECTION_RAFFLE,
  INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
} from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { resolveIntroAdModerationOverviewTileStyles } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionZone";
import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";

type IntroAdModerationPageOverviewProps = {
  pendingTotal: number;
  introPendingCount: number;
  bannerPendingCount: number;
  rafflePendingCount: number;
  attentionCount: number;
  attentionOnly: boolean;
  onPendingFilterClick: () => void;
  onIntroFilterClick: () => void;
  onBannerFilterClick: () => void;
  onRaffleFilterClick: () => void;
  showUsersRaffleOverview?: boolean;
  onUsersRaffleFilterClick?: () => void;
  onAttentionFilterChange: (value: boolean) => void;
};

export const IntroAdModerationPageOverview = ({
  pendingTotal,
  introPendingCount,
  bannerPendingCount,
  rafflePendingCount,
  attentionCount,
  attentionOnly,
  onPendingFilterClick,
  onIntroFilterClick,
  onBannerFilterClick,
  onRaffleFilterClick,
  showUsersRaffleOverview = false,
  onUsersRaffleFilterClick,
  onAttentionFilterChange,
}: IntroAdModerationPageOverviewProps) => {
  const styles = useIntroAdModerationPageStyles();

  return (
    <View style={styles.overview} accessibilityRole="summary">
      <Pressable style={styles.overviewTile} onPress={onPendingFilterClick}>
        <Text style={styles.overviewLabel}>{INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_PENDING}</Text>
        <Text style={styles.overviewValue}>{pendingTotal}</Text>
      </Pressable>

      <Pressable
        style={resolveIntroAdModerationOverviewTileStyles(INTRO_AD_MODERATION_SECTION_INTRO, styles)}
        onPress={onIntroFilterClick}
      >
        <Text style={styles.overviewLabel}>{INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_INTRO}</Text>
        <Text style={styles.overviewValue}>{introPendingCount}</Text>
      </Pressable>

      <Pressable
        style={resolveIntroAdModerationOverviewTileStyles(INTRO_AD_MODERATION_SECTION_BANNER, styles)}
        onPress={onBannerFilterClick}
      >
        <Text style={styles.overviewLabel}>{INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_BANNER}</Text>
        <Text style={styles.overviewValue}>{bannerPendingCount}</Text>
      </Pressable>

      <Pressable
        style={resolveIntroAdModerationOverviewTileStyles(INTRO_AD_MODERATION_SECTION_RAFFLE, styles)}
        onPress={onRaffleFilterClick}
      >
        <Text style={styles.overviewLabel}>{INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_RAFFLE}</Text>
        <Text style={styles.overviewValue}>{rafflePendingCount}</Text>
      </Pressable>

      {showUsersRaffleOverview && onUsersRaffleFilterClick ? (
        <Pressable
          style={resolveIntroAdModerationOverviewTileStyles(
            INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
            styles,
          )}
          onPress={onUsersRaffleFilterClick}
        >
          <Text style={styles.overviewLabel}>
            {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_USERS_RAFFLE}
          </Text>
          <Text style={styles.overviewValueMuted}>—</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={resolveIntroAdModerationOverviewTileStyles(null, styles, {
          active: attentionOnly,
          attention: attentionCount > 0,
        })}
        accessibilityRole="button"
        accessibilityState={{ selected: attentionOnly }}
        onPress={() => onAttentionFilterChange(!attentionOnly)}
      >
        <Text style={styles.overviewLabel}>{INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_ATTENTION}</Text>
        <Text
          style={[
            styles.overviewValue,
            attentionCount > 0 ? styles.overviewValueAttention : null,
          ]}
        >
          {attentionCount}
        </Text>
      </Pressable>
    </View>
  );
};
