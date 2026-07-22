import { View } from "react-native";

import { INTRO_AD_MODERATION_SECTION_USERS_RAFFLE } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { resolveIntroAdModerationListPanelStyles } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionZone";
import { UsersLoyaltyRaffleAdminPanel } from "@/features/raffles-staff-page/ui/UsersLoyaltyRaffleAdminPanel";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";

export const UsersLoyaltyRaffleAdminModerationSection = () => {
  const styles = useIntroAdModerationPageStyles();

  return (
    <View style={styles.section}>
      <View style={resolveIntroAdModerationListPanelStyles(INTRO_AD_MODERATION_SECTION_USERS_RAFFLE, styles)}>
        <UsersLoyaltyRaffleAdminPanel />
      </View>
    </View>
  );
};
