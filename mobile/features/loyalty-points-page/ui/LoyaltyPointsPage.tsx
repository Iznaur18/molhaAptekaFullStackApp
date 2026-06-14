import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import {
  LOYALTY_POINTS_PURCHASE_MAX_RUB,
  LOYALTY_POINTS_PURCHASE_MIN_RUB,
} from "@/features/loyalty-points-page/model/loyaltyPointsPurchaseConstants";
import { LOYALTY_POINTS_PAGE_UI } from "@/shared/config";
import { rublesToLoyaltyPoints } from "@/shared/config/loyaltyPointsConstants";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const parseRubAmount = (value: string): number | null => {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const LoyaltyPointsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const statusQuery = useMyLoyaltyPointsStatusQuery(isAuthorized);
  const [purchaseAmountInput, setPurchaseAmountInput] = useState("");
  const [purchaseValidationError, setPurchaseValidationError] = useState("");
  const [comingSoonMessage, setComingSoonMessage] = useState("");

  const purchaseAmountRub = useMemo(
    () => parseRubAmount(purchaseAmountInput),
    [purchaseAmountInput],
  );

  const purchasePointsPreview = useMemo(() => {
    if (purchaseAmountRub == null) {
      return 0;
    }
    return rublesToLoyaltyPoints(purchaseAmountRub);
  }, [purchaseAmountRub]);

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {LOYALTY_POINTS_PAGE_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>{LOYALTY_POINTS_PAGE_UI.LOGIN_BUTTON}</Text>
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

  const handlePurchaseSubmit = () => {
    setComingSoonMessage("");
    if (purchaseAmountRub == null) {
      setPurchaseValidationError(
        LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MIN(LOYALTY_POINTS_PURCHASE_MIN_RUB),
      );
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

  const canSubmitPurchase =
    purchaseAmountRub != null &&
    purchaseAmountRub >= LOYALTY_POINTS_PURCHASE_MIN_RUB &&
    purchaseAmountRub <= LOYALTY_POINTS_PURCHASE_MAX_RUB;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.balance, { color: theme.colors.text }]}>
        {LOYALTY_POINTS_PAGE_UI.BALANCE_POINTS(balance)}
      </Text>
      <Text style={[styles.info, { color: theme.colors.textMuted }]}>
        {LOYALTY_POINTS_PAGE_UI.INFO}
      </Text>
      {LOYALTY_POINTS_PAGE_UI.USES.map((item) => (
        <Text key={item} style={[styles.use, { color: theme.colors.text }]}>
          • {item}
        </Text>
      ))}

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {LOYALTY_POINTS_PAGE_UI.PURCHASE_SECTION}
      </Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_LABEL}
      </Text>
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        value={purchaseAmountInput}
        onChangeText={(value) => {
          setPurchaseAmountInput(value);
          setPurchaseValidationError("");
          setComingSoonMessage("");
        }}
        keyboardType="number-pad"
        placeholder={String(LOYALTY_POINTS_PURCHASE_MIN_RUB)}
      />
      <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
        {LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_HINT}
      </Text>
      {purchasePointsPreview > 0 ? (
        <Text style={[styles.preview, { color: theme.colors.text }]}>
          {LOYALTY_POINTS_PAGE_UI.PURCHASE_POINTS_PREVIEW(purchasePointsPreview)}
        </Text>
      ) : null}
      {purchaseValidationError ? (
        <Text style={styles.error}>{purchaseValidationError}</Text>
      ) : null}
      <Pressable
        style={[
          styles.button,
          { backgroundColor: theme.colors.nearBlack },
          !canSubmitPurchase && styles.disabled,
        ]}
        onPress={handlePurchaseSubmit}
        disabled={!canSubmitPurchase}
      >
        <Text style={styles.buttonText}>{LOYALTY_POINTS_PAGE_UI.BUY}</Text>
      </Pressable>
      {comingSoonMessage ? <Text style={styles.soon}>{comingSoonMessage}</Text> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  balance: {
    fontSize: 22,
    fontWeight: "700",
  },
  info: {
    fontSize: 15,
    lineHeight: 22,
  },
  use: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  preview: {
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
  },
  error: {
    color: "#c62828",
    fontSize: 14,
  },
  soon: {
    color: "#2e7d32",
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});
