import { Text, View } from "react-native";

import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";

type ModerationSectionTitleProps = {
  title: string;
  pendingCount?: number;
};

export const ModerationSectionTitle = ({
  title,
  pendingCount = 0,
}: ModerationSectionTitleProps) => {
  const styles = useIntroAdModerationPageStyles();
  const showBadge = pendingCount > 0;

  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showBadge ? (
        <View style={styles.sectionBadge} accessibilityLabel={`${pendingCount} на модерации`}>
          <Text style={styles.sectionBadgeText}>
            {INTRO_AD_MODERATION_PAGE_UI.PENDING_BADGE(pendingCount)}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
