import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

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
import { useAdvertisingPageStyles } from "@/shared/theme/sellerFlowStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const AdvertisingPage = () => {
  const router = useRouter();
  const styles = useAdvertisingPageStyles();
  const isAuthorized = useIsAuthorized();
  const loyaltyQuery = useMyLoyaltyPointsStatusQuery(isAuthorized);
  const introQuery = useMyIntroAdCampaignQuery(isAuthorized);
  const personalCategoryQuery = useMySellerPersonalCategoryCampaignQuery(isAuthorized);

  const loyaltyBalance = loyaltyQuery.data?.loyaltyPointsBalance ?? 0;

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{ADVERTISING_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
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
      <Text style={styles.lead}>{ADVERTISING_PAGE_UI.PAGE_LEAD}</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{ADVERTISING_PAGE_UI.BALANCE_LABEL}</Text>
        <Text style={styles.balance}>{ADVERTISING_PAGE_UI.BALANCE(loyaltyBalance)}</Text>
      </View>

      <IntroAdAdvertisingSection loyaltyBalance={loyaltyBalance} />
      <PersonalCategoryAdvertisingSection loyaltyBalance={loyaltyBalance} />
    </ScrollView>
  );
};
