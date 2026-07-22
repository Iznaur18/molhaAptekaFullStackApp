import { Feather } from "@expo/vector-icons";
import {
  LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX,
  LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN,
} from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type AccessibilityState,
} from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useAdminCreditOwnLoyaltyPointsMutation } from "@/entities/user/model/useAdminCreditOwnLoyaltyPointsMutation";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import {
  LOYALTY_POINTS_PURCHASE_MAX_RUB,
  LOYALTY_POINTS_PURCHASE_MIN_RUB,
} from "@/features/loyalty-points-page/model/loyaltyPointsPurchaseConstants";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { LOYALTY_POINTS_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { rublesToLoyaltyPoints } from "@/shared/config/loyaltyPointsConstants";
import { formatApiErrorMessage } from "@/shared/lib";
import { pluralizeRuBall } from "@/shared/lib/pluralizeRuBall";
import { formatRubPriceInput, parseRubPriceInput } from "@/shared/lib/rubPriceInput";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useLoyaltyPointsPageStyles } from "@/shared/theme/loyaltyPointsPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

/** Иконки пунктов «на что тратить» — по порядку LOYALTY_POINTS_PAGE_UI.USES. */
const USE_ICONS: (keyof typeof Feather.glyphMap)[] = [
  "award",
  "trending-up",
  "play-circle",
  "gift",
];

export const LoyaltyPointsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoyaltyPointsPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const { isAdmin } = useUserAccess();
  const statusQuery = useMyLoyaltyPointsStatusQuery(isAuthorized);
  const adminCreditMutation = useAdminCreditOwnLoyaltyPointsMutation();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [purchaseAmountInput, setPurchaseAmountInput] = useState("");
  const [purchaseValidationError, setPurchaseValidationError] = useState("");
  const [comingSoonMessage, setComingSoonMessage] = useState("");
  const [adminAmountInput, setAdminAmountInput] = useState("");
  const [adminValidationError, setAdminValidationError] = useState("");
  const [adminSuccessMessage, setAdminSuccessMessage] = useState("");

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

  const adminAmountPoints = useMemo(
    () => parseRubPriceInput(adminAmountInput),
    [adminAmountInput],
  );

  const handlePurchaseAmountChange = (value: string) => {
    setPurchaseAmountInput(formatRubPriceInput(value));
    setPurchaseValidationError("");
    setComingSoonMessage("");
  };

  const handleAdminAmountChange = (value: string) => {
    setAdminAmountInput(formatRubPriceInput(value));
    setAdminValidationError("");
    setAdminSuccessMessage("");
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

  const handleAdminFreeCreditSubmit = async () => {
    setAdminSuccessMessage("");
    if (adminAmountPoints == null) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MIN(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN),
      );
      return;
    }
    if (adminAmountPoints < LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MIN(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN),
      );
      return;
    }
    if (adminAmountPoints > LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MAX(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX),
      );
      return;
    }

    setAdminValidationError("");
    try {
      const result = await adminCreditMutation.mutateAsync({
        amount: adminAmountPoints,
      });
      setAdminSuccessMessage(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_SUCCESS(
          result.credited,
          result.loyaltyPointsBalance,
        ),
      );
      setAdminAmountInput("");
    } catch (error) {
      setAdminValidationError(
        formatApiErrorMessage(error, LOYALTY_POINTS_PAGE_UI.FETCH_FALLBACK),
      );
    }
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
  const canSubmitAdminCredit =
    adminAmountPoints != null &&
    adminAmountPoints >= LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN &&
    adminAmountPoints <= LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX &&
    !adminCreditMutation.isPending;

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

          <View
            style={styles.balanceCard}
            accessibilityLabel={LOYALTY_POINTS_PAGE_UI.BALANCE_POINTS(balance)}
          >
            <View style={styles.balanceTextBlock}>
              <Text style={styles.balanceCaption}>
                {LOYALTY_POINTS_PAGE_UI.BALANCE_CAPTION}
              </Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceValue}>{balance}</Text>
                <Text style={styles.balanceUnit}>{pluralizeRuBall(balance)}</Text>
              </View>
              <Text style={styles.balanceInfo}>{LOYALTY_POINTS_PAGE_UI.INFO}</Text>
            </View>
            <View style={styles.balanceIconWrap}>
              <Feather name="award" size={26} color={theme.colors.onContrast} />
            </View>
          </View>

          <View style={styles.purchase}>
            <Text style={styles.purchaseTitle}>{LOYALTY_POINTS_PAGE_UI.PURCHASE_SECTION}</Text>
            <Text style={styles.purchaseLabel}>
              {LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_LABEL}
            </Text>
            <TextInput
              style={styles.purchaseInput}
              value={purchaseAmountInput}
              onChangeText={handlePurchaseAmountChange}
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder={String(LOYALTY_POINTS_PURCHASE_MIN_RUB)}
              placeholderTextColor={theme.colors.textMuted}
              // `invalid` — web-only (react-native-web → aria-invalid); RN-типы его не знают.
              accessibilityState={
                { invalid: Boolean(purchaseValidationError) } as unknown as AccessibilityState
              }
            />
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
            <AppButton
              label={LOYALTY_POINTS_PAGE_UI.BUY}
              variant="primary"
              style={styles.buyButton}
              onPress={handlePurchaseSubmit}
              disabled={!canSubmitPurchase}
            />
            {comingSoonMessage ? (
              <Text style={styles.soon} accessibilityRole="text">
                {comingSoonMessage}
              </Text>
            ) : null}
          </View>

          {isAdmin ? (
            <View style={styles.purchase}>
              <Text style={styles.purchaseTitle}>
                {LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_SECTION}
              </Text>
              <Text style={styles.purchaseLabel}>
                {LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_LABEL}
              </Text>
              <TextInput
                style={styles.purchaseInput}
                value={adminAmountInput}
                onChangeText={handleAdminAmountChange}
                keyboardType="number-pad"
                inputMode="numeric"
                placeholder={String(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN)}
                placeholderTextColor={theme.colors.textMuted}
                editable={!adminCreditMutation.isPending}
                accessibilityState={
                  { invalid: Boolean(adminValidationError) } as unknown as AccessibilityState
                }
              />
              <Text style={styles.purchaseHint}>
                {LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_HINT}
              </Text>
              {adminValidationError ? (
                <Text style={styles.purchaseError} accessibilityRole="alert">
                  {adminValidationError}
                </Text>
              ) : null}
              {adminSuccessMessage ? (
                <Text style={styles.soon} accessibilityRole="text">
                  {adminSuccessMessage}
                </Text>
              ) : null}
              <AppButton
                label={
                  adminCreditMutation.isPending
                    ? LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_SUBMITTING
                    : LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_SUBMIT
                }
                variant="primary"
                style={styles.buyButton}
                onPress={() => {
                  void handleAdminFreeCreditSubmit();
                }}
                disabled={!canSubmitAdminCredit}
              />
            </View>
          ) : null}

          <View style={styles.usesCard}>
            <Text style={styles.usesTitle}>{LOYALTY_POINTS_PAGE_UI.USES_TITLE}</Text>
            {LOYALTY_POINTS_PAGE_UI.USES.map((item, index) => (
              <View key={item} style={styles.useRow}>
                <View style={styles.useIconWrap}>
                  <Feather
                    name={USE_ICONS[index] ?? "check-circle"}
                    size={16}
                    color={theme.colors.action}
                  />
                </View>
                <Text style={styles.useText}>{item}</Text>
              </View>
            ))}
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
