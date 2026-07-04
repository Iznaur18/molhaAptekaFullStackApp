import { Pressable, Text, View } from "react-native";

import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";

type IntroAdModerationPageOverviewProps = {
  pendingTotal: number;
  introPendingCount: number;
  bannerPendingCount: number;
  attentionCount: number;
  attentionOnly: boolean;
  onPendingFilterClick: () => void;
  onIntroFilterClick: () => void;
  onBannerFilterClick: () => void;
  onAttentionFilterChange: (value: boolean) => void;
};

export const IntroAdModerationPageOverview = ({
  pendingTotal,
  introPendingCount,
  bannerPendingCount,
  attentionCount,
  attentionOnly,
  onPendingFilterClick,
  onIntroFilterClick,
  onBannerFilterClick,
  onAttentionFilterChange,
}: IntroAdModerationPageOverviewProps) => {
  const styles = useIntroAdModerationPageStyles();

  return (
    <View style={styles.overview} accessibilityRole="summary">
      <Pressable style={styles.overviewTile} onPress={onPendingFilterClick}>
        <Text style={styles.overviewLabel}>{INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_PENDING}</Text>
        <Text style={styles.overviewValue}>{pendingTotal}</Text>
      </Pressable>

      <Pressable style={styles.overviewTile} onPress={onIntroFilterClick}>
        <Text style={styles.overviewLabel}>{INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_INTRO}</Text>
        <Text style={styles.overviewValue}>{introPendingCount}</Text>
      </Pressable>

      <Pressable style={styles.overviewTile} onPress={onBannerFilterClick}>
        <Text style={styles.overviewLabel}>{INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_BANNER}</Text>
        <Text style={styles.overviewValue}>{bannerPendingCount}</Text>
      </Pressable>

      <Pressable
        style={[
          styles.overviewTile,
          attentionOnly ? styles.overviewTileActive : null,
          attentionCount > 0 ? styles.overviewTileAttention : null,
        ]}
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
