import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import {
  LOYALTY_POINTS_PURCHASE_MAX_RUB,
  LOYALTY_POINTS_PURCHASE_MIN_RUB,
} from "@/features/loyalty-points-page/model/loyaltyPointsPurchaseConstants";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { LOYALTY_POINTS_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { rublesToLoyaltyPoints } from "@/shared/config/loyaltyPointsConstants";
import { formatApiErrorMessage } from "@/shared/lib";
import { formatRubPriceInput, parseRubPriceInput } from "@/shared/lib/rubPriceInput";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useLoyaltyPointsPageStyles } from "@/shared/theme/loyaltyPointsPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const LoyaltyPointsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoyaltyPointsPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const statusQuery = useMyLoyaltyPointsStatusQuery(isAuthorized);
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [purchaseAmountInput, setPurchaseAmountInput] = useState("");
  const [purchaseValidationError, setPurchaseValidationError] = useState("");
  const [comingSoonMessage, setComingSoonMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void statusQuery.refetch();
      }
    }, [isAuthorized, statusQuery.refetch]),
  );

  const purchaseAmountRub = useMemo(
    () => parseRubPriceInput(purchaseAmountInput),
    [purchaseAmountInput],
  );

  const purchasePointsPreview = useMemo(() => {
    if (purchaseAmountRub == null) {
      return 0;
    }
    return rublesToLoyaltyPoints(purchaseAmountRub);
  }, [purchaseAmountRub]);

  const handlePurchaseAmountChange = (value: string) => {
    setPurchaseAmountInput(formatRubPriceInput(value));
    setPurchaseValidationError("");
    setComingSoonMessage("");
  };

  const handlePurchaseSubmit = () => {
    setComingSoonMessage("");
    if (purchaseAmountRub == null) {
      setPurchaseValidationError(LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MIN(1));
      return;
    }
    if (purchaseAmountRub < LOYALTY_POINTS_PURCHASE_MIN_RUB) {
      setPurchaseValidationError(
        LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MIN(LOYALTY_POINTS_PURCHASE_MIN_RUB),
      );
      return;
    }
    if (purchaseAmountRub > LOYALTY_POINTS_PURCHASE_MAX_RUB) {
      setPurchaseValidationError(
        LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MAX(LOYALTY_POINTS_PURCHASE_MAX_RUB),
      );
      return;
    }
    setPurchaseValidationError("");
    setComingSoonMessage(
      LOYALTY_POINTS_PAGE_UI.COMING_SOON_AMOUNT(purchaseAmountRub, purchasePointsPreview),
    );
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{LOYALTY_POINTS_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{LOYALTY_POINTS_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (statusQuery.isPending) {
    return <ScreenLoadingState message={LOYALTY_POINTS_PAGE_UI.LOADING} />;
  }

  if (statusQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(statusQuery.error, LOYALTY_POINTS_PAGE_UI.FETCH_FALLBACK)}
        onRetry={() => statusQuery.refetch()}
      />
    );
  }

  const balance = statusQuery.data?.loyaltyPointsBalance ?? 0;
  const canSubmitPurchase =
    purchaseAmountRub != null &&
    purchaseAmountRub >= LOYALTY_POINTS_PURCHASE_MIN_RUB &&
    purchaseAmountRub <= LOYALTY_POINTS_PURCHASE_MAX_RUB;

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: contentPaddingBottom },
        ]}
        accessibilityLabel={LOYALTY_POINTS_PAGE_UI.PAGE_ARIA}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_LOYALTY_POINTS}
            onPress={() => setNavSheetVisible(true)}
          />

          <Text style={styles.balance}>{LOYALTY_POINTS_PAGE_UI.BALANCE_POINTS(balance)}</Text>
          <Text style={styles.info}>{LOYALTY_POINTS_PAGE_UI.INFO}</Text>
          <View style={styles.uses}>
            {LOYALTY_POINTS_PAGE_UI.USES.map((item) => (
              <Text key={item} style={styles.use}>
                {item}
              </Text>
            ))}
          </View>

          <View style={styles.purchase}>
            <Text style={styles.purchaseTitle}>{LOYALTY_POINTS_PAGE_UI.PURCHASE_SECTION}</Text>
            <View style={styles.purchaseLabel}>
              <Text>{LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_LABEL}</Text>
              <TextInput
                style={styles.purchaseInput}
                value={purchaseAmountInput}
                onChangeText={handlePurchaseAmountChange}
                keyboardType="number-pad"
                inputMode="numeric"
                placeholder={String(LOYALTY_POINTS_PURCHASE_MIN_RUB)}
                placeholderTextColor={theme.colors.textMuted}
                accessibilityState={{ invalid: Boolean(purchaseValidationError) }}
              />
            </View>
            <Text style={styles.purchaseHint}>{LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_HINT}</Text>
            {purchasePointsPreview > 0 ? (
              <Text style={styles.purchasePreview}>
                {LOYALTY_POINTS_PAGE_UI.PURCHASE_POINTS_PREVIEW(purchasePointsPreview)}
              </Text>
            ) : null}
            {purchaseValidationError ? (
              <Text style={styles.purchaseError} accessibilityRole="alert">
                {purchaseValidationError}
              </Text>
            ) : null}
            <Pressable
              style={[styles.buy, !canSubmitPurchase && styles.buyDisabled]}
              onPress={handlePurchaseSubmit}
              disabled={!canSubmitPurchase}
            >
              <Text style={styles.buyText}>{LOYALTY_POINTS_PAGE_UI.BUY}</Text>
            </Pressable>
            {comingSoonMessage ? (
              <Text style={styles.soon} accessibilityRole="text">
                {comingSoonMessage}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="loyalty-points"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
