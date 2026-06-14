import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useMyIntroAdCampaignQuery } from "@/entities/intro-ad/model/useMyIntroAdCampaignQuery";
import { useMySellerPersonalCategoryCampaignQuery } from "@/entities/seller-personal-category/model/useMySellerPersonalCategoryCampaignQuery";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { IntroAdAdvertisingSection } from "@/features/advertising-page/ui/IntroAdAdvertisingSection";
import { PersonalCategoryAdvertisingSection } from "@/features/advertising-page/ui/PersonalCategoryAdvertisingSection";
import {
  ADVERTISING_PAGE_UI,
  INTRO_AD_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const AdvertisingPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const loyaltyQuery = useMyLoyaltyPointsStatusQuery(isAuthorized);
  const introQuery = useMyIntroAdCampaignQuery(isAuthorized);
  const personalCategoryQuery = useMySellerPersonalCategoryCampaignQuery(isAuthorized);

  const loyaltyBalance = loyaltyQuery.data?.loyaltyPointsBalance ?? 0;

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {ADVERTISING_PAGE_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>{ADVERTISING_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  const isLoading =
    introQuery.isPending || personalCategoryQuery.isPending || loyaltyQuery.isPending;
  const queryError = introQuery.error ?? personalCategoryQuery.error ?? loyaltyQuery.error;

  if (isLoading) {
    return <ScreenLoadingState message={ADVERTISING_PAGE_UI.LOADING} />;
  }

  if (queryError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(queryError, INTRO_AD_PAGE_UI.FETCH_FALLBACK)}
        onRetry={() => {
          void introQuery.refetch();
          void personalCategoryQuery.refetch();
          void loyaltyQuery.refetch();
        }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.lead, { color: theme.colors.textMuted }]}>
        {ADVERTISING_PAGE_UI.PAGE_LEAD}
      </Text>

      <View style={[styles.balanceCard, { borderColor: theme.colors.border }]}>
        <Text style={[styles.balanceLabel, { color: theme.colors.textMuted }]}>
          {ADVERTISING_PAGE_UI.BALANCE_LABEL}
        </Text>
        <Text style={[styles.balance, { color: theme.colors.text }]}>
          {ADVERTISING_PAGE_UI.BALANCE(loyaltyBalance)}
        </Text>
      </View>

      <IntroAdAdvertisingSection loyaltyBalance={loyaltyBalance} />
      <PersonalCategoryAdvertisingSection loyaltyBalance={loyaltyBalance} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
  },
  balanceCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    backgroundColor: "#fff",
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  balance: {
    fontSize: 22,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
