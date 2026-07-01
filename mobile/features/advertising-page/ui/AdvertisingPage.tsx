import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useMyIntroAdCampaignQuery } from "@/entities/intro-ad/model/useMyIntroAdCampaignQuery";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { IntroAdAdvertisingSection } from "@/features/advertising-page/ui/IntroAdAdvertisingSection";
import { PersonalCategoryAdvertisingSection } from "@/features/advertising-page/ui/PersonalCategoryAdvertisingSection";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  ADVERTISING_PAGE_UI,
  INTRO_AD_PAGE_UI,
  MY_PROFILE_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAdvertisingPageStyles } from "@/shared/theme/advertisingPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const AdvertisingPage = () => {
  const router = useRouter();
  const styles = useAdvertisingPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const loyaltyQuery = useMyLoyaltyPointsStatusQuery(isAuthorized);
  const campaignQuery = useMyIntroAdCampaignQuery(isAuthorized);
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void loyaltyQuery.refetch();
        void campaignQuery.refetch();
      }
    }, [isAuthorized, loyaltyQuery.refetch, campaignQuery.refetch]),
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{INTRO_AD_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{INTRO_AD_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (campaignQuery.isPending || loyaltyQuery.isPending) {
    return <ScreenLoadingState message={INTRO_AD_PAGE_UI.LOADING} />;
  }

  if (campaignQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(campaignQuery.error, INTRO_AD_PAGE_UI.FETCH_FALLBACK)}
        onRetry={() => campaignQuery.refetch()}
      />
    );
  }

  const loyaltyBalance = loyaltyQuery.data?.loyaltyPointsBalance ?? 0;

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: contentPaddingBottom },
        ]}
        accessibilityLabel={INTRO_AD_PAGE_UI.PAGE_ARIA}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_ADVERTISING}
            onPress={() => setNavSheetVisible(true)}
          />

          <Text style={styles.pageLead}>{ADVERTISING_PAGE_UI.PAGE_LEAD}</Text>

          <View style={styles.balanceBar}>
            <Text style={styles.balanceLabel}>{ADVERTISING_PAGE_UI.BALANCE_LABEL}</Text>
            <Text style={styles.balanceValue}>
              {ADVERTISING_PAGE_UI.BALANCE(loyaltyBalance)}
            </Text>
          </View>

          <View style={styles.cards}>
            <IntroAdAdvertisingSection loyaltyBalance={loyaltyBalance} />
            <PersonalCategoryAdvertisingSection loyaltyBalance={loyaltyBalance} />
          </View>
        </View>
      </ScrollView>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="advertising"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
