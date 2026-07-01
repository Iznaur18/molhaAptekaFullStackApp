import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useMyPremiumStatusQuery } from "@/entities/user/model/useMyPremiumStatusQuery";
import { usePurchasePremiumMutation } from "@/entities/user/model/usePurchasePremiumMutation";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PROFILE_PAGE_UI, PREMIUM_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { usePremiumPageStyles } from "@/shared/theme/premiumPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const PremiumPage = () => {
  const router = useRouter();
  const styles = usePremiumPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const statusQuery = useMyPremiumStatusQuery(isAuthorized);
  const purchaseMutation = usePurchasePremiumMutation();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void statusQuery.refetch();
      }
    }, [isAuthorized, statusQuery.refetch]),
  );

  const handlePurchase = async () => {
    setFeedback("");
    setErrorMessage("");
    try {
      const result = await purchaseMutation.mutateAsync();
      setFeedback(result.message);
      void statusQuery.refetch();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : PREMIUM_PAGE_UI.PURCHASE_FALLBACK);
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{PREMIUM_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{PREMIUM_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (statusQuery.isPending) {
    return <ScreenLoadingState message={PREMIUM_PAGE_UI.LOADING} />;
  }

  const status = statusQuery.data;
  const pricePoints = status?.pricePoints ?? 0;
  const loyaltyPointsBalance = status?.loyaltyPointsBalance ?? 0;
  const isActive = status?.isActive ?? false;
  const canPurchase = status?.canPurchase ?? false;
  const hasEnoughPoints = loyaltyPointsBalance >= pricePoints;
  const isSubmitting = purchaseMutation.isPending;

  if (statusQuery.isError && !pricePoints) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(statusQuery.error, PREMIUM_PAGE_UI.FETCH_FALLBACK)}
        onRetry={() => statusQuery.refetch()}
      />
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: contentPaddingBottom },
        ]}
        accessibilityLabel={PREMIUM_PAGE_UI.PAGE_ARIA}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_PREMIUM}
            onPress={() => setNavSheetVisible(true)}
          />

          <View style={styles.plan}>
            <Text style={styles.planTitle}>{PREMIUM_PAGE_UI.PLAN_TITLE}</Text>
            <Text style={styles.planPrice}>{PREMIUM_PAGE_UI.PLAN_PRICE(pricePoints)}</Text>
            <Text style={styles.planPeriod}>{PREMIUM_PAGE_UI.PLAN_PERIOD}</Text>
            <View style={styles.benefits}>
              {PREMIUM_PAGE_UI.PLAN_BENEFITS.map((item) => (
                <Text key={item} style={styles.benefit}>
                  • {item}
                </Text>
              ))}
            </View>
            <Text style={styles.balance}>{PREMIUM_PAGE_UI.BALANCE(loyaltyPointsBalance)}</Text>
          </View>

          {isActive ? (
            <Text style={styles.active} accessibilityRole="text">
              {PREMIUM_PAGE_UI.ACTIVE}
            </Text>
          ) : null}

          {feedback ? (
            <Text style={styles.active} accessibilityRole="text">
              {feedback}
            </Text>
          ) : null}

          {errorMessage ? (
            <Text style={styles.error} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}

          {canPurchase ? (
            <>
              {!hasEnoughPoints ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {PREMIUM_PAGE_UI.INSUFFICIENT_POINTS(pricePoints, loyaltyPointsBalance)}
                </Text>
              ) : null}
              <Pressable
                style={[
                  styles.submit,
                  (isSubmitting || !hasEnoughPoints) && styles.submitDisabled,
                ]}
                disabled={isSubmitting || !hasEnoughPoints}
                onPress={() => {
                  void handlePurchase();
                }}
              >
                <Text style={styles.submitText}>
                  {isSubmitting ? PREMIUM_PAGE_UI.SUBMIT_PENDING : PREMIUM_PAGE_UI.SUBMIT}
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </ScrollView>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="premium"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
