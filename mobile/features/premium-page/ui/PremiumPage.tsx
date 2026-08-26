import { Feather } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useMyPremiumStatusQuery } from "@/entities/user/model/useMyPremiumStatusQuery";
import { usePurchasePremiumMutation } from "@/entities/user/model/usePurchasePremiumMutation";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { UserPremiumVerifiedBadge } from "@/entities/user/ui/UserPremiumVerifiedBadge";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PROFILE_PAGE_UI, PREMIUM_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { pluralizeRuBall } from "@/shared/lib/pluralizeRuBall";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { usePremiumPageStyles } from "@/shared/theme/premiumPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const PremiumPage = () => {
  const router = useRouter();
  const styles = usePremiumPageStyles();
  const theme = useAppTheme();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
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
      <ProfileAccountScrollBody
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          !isDrawerLayout ? styles.contentInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        accessibilityLabel={PREMIUM_PAGE_UI.PAGE_ARIA}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_PREMIUM}
            onPress={() => setNavSheetVisible(true)}
          />

          <View
            style={styles.heroCard}
            accessibilityLabel={`${PREMIUM_PAGE_UI.PLAN_TITLE}: ${PREMIUM_PAGE_UI.PLAN_PRICE(pricePoints)}`}
          >
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroCaption}>{PREMIUM_PAGE_UI.PLAN_TITLE}</Text>
              <View style={styles.heroRow}>
                <Text style={styles.heroValue}>{pricePoints}</Text>
                <Text style={styles.heroUnit}>{pluralizeRuBall(pricePoints)}</Text>
              </View>
              <Text style={styles.heroInfo}>{PREMIUM_PAGE_UI.PLAN_PERIOD}</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <UserPremiumVerifiedBadge size={26} />
            </View>
          </View>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>{PREMIUM_PAGE_UI.BENEFITS_TITLE}</Text>
            {PREMIUM_PAGE_UI.PLAN_BENEFITS.map((item) => (
              <View key={item} style={styles.benefitRow}>
                <View style={styles.benefitIconWrap}>
                  <Feather
                    name="check"
                    size={16}
                    color={theme.colors.warning}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                </View>
                <Text style={styles.benefitText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.balanceIconWrap}>
              <Feather
                name="award"
                size={16}
                color={theme.colors.action}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </View>
            <Text style={styles.balance}>
              {PREMIUM_PAGE_UI.BALANCE(loyaltyPointsBalance)}
            </Text>
          </View>

          {isActive ? (
            <View style={styles.statusBanner} accessibilityRole="text">
              <MaterialIcons
                name="verified"
                size={20}
                color={theme.colors.successText}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.active}>{PREMIUM_PAGE_UI.ACTIVE}</Text>
            </View>
          ) : null}

          {feedback ? (
            <View style={styles.feedbackBanner} accessibilityRole="text">
              <MaterialIcons
                name="info"
                size={20}
                color={theme.colors.infoDeep}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <MaterialIcons
                name="error-outline"
                size={20}
                color={theme.colors.danger}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.error}>{errorMessage}</Text>
            </View>
          ) : null}

          {canPurchase ? (
            <View style={styles.actions}>
              {!hasEnoughPoints ? (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <MaterialIcons
                    name="error-outline"
                    size={20}
                    color={theme.colors.danger}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                  <Text style={styles.error}>
                    {PREMIUM_PAGE_UI.INSUFFICIENT_POINTS(pricePoints, loyaltyPointsBalance)}
                  </Text>
                </View>
              ) : null}
              <AppButton
                label={isSubmitting ? PREMIUM_PAGE_UI.SUBMIT_PENDING : PREMIUM_PAGE_UI.SUBMIT}
                variant="primary"
                style={styles.submitButton}
                disabled={isSubmitting || !hasEnoughPoints}
                onPress={() => {
                  void handlePurchase();
                }}
              />
            </View>
          ) : null}
        </View>
      </ProfileAccountScrollBody>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="premium"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
