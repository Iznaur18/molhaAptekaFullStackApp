import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { AffiliateEarningsPanel } from "@/features/affiliate-listings-page/ui/AffiliateEarningsPanel";
import { AFFILIATE_LISTINGS_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { AppButton } from "@/shared/ui/AppButton";

/** @deprecated Deep-link only; UI lives inside PartnerProgramPage. */
export const AffiliateListingsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const { contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();

  if (!isAuthorized) {
    return (
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: theme.colors.textMuted }}>
          {AFFILIATE_LISTINGS_PAGE_UI.LOGIN_HINT}
        </Text>
        <AppButton
          label={AFFILIATE_LISTINGS_PAGE_UI.LOGIN_BUTTON}
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 16,
        paddingBottom: contentPaddingBottom,
      }}
    >
      <AffiliateEarningsPanel enabled={isAuthorized} />
    </ScrollView>
  );
};
