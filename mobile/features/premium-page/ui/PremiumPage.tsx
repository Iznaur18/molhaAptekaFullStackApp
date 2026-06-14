import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useMyPremiumStatusQuery } from "@/entities/user/model/useMyPremiumStatusQuery";
import { usePurchasePremiumMutation } from "@/entities/user/model/usePurchasePremiumMutation";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { PREMIUM_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { usePremiumPageStyles } from "@/shared/theme/accountFeatureStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const PremiumPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = usePremiumPageStyles();
  const isAuthorized = useIsAuthorized();
  const statusQuery = useMyPremiumStatusQuery(isAuthorized);
  const purchaseMutation = usePurchasePremiumMutation();
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{PREMIUM_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{PREMIUM_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (statusQuery.isPending) {
    return <ScreenLoadingState message={PREMIUM_PAGE_UI.LOADING} />;
  }

  if (statusQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(statusQuery.error, PREMIUM_PAGE_UI.FETCH_FALLBACK)}
        onRetry={() => statusQuery.refetch()}
      />
    );
  }

  const status = statusQuery.data;
  const hasEnoughPoints =
    (status?.loyaltyPointsBalance ?? 0) >= (status?.pricePoints ?? 0);

  const handlePurchase = async () => {
    setFeedback("");
    setErrorMessage("");
    try {
      const result = await purchaseMutation.mutateAsync();
      setFeedback(result.message);
      void statusQuery.refetch();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PREMIUM_PAGE_UI.PURCHASE_FALLBACK,
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{PREMIUM_PAGE_UI.PLAN_TITLE}</Text>
      <Text style={styles.price}>{PREMIUM_PAGE_UI.PLAN_PRICE(status?.pricePoints ?? 0)}</Text>
      <Text style={styles.meta}>{PREMIUM_PAGE_UI.PLAN_PERIOD}</Text>
      {PREMIUM_PAGE_UI.PLAN_BENEFITS.map((item) => (
        <Text key={item} style={styles.benefit}>
          • {item}
        </Text>
      ))}
      <Text style={styles.balance}>
        {PREMIUM_PAGE_UI.BALANCE(status?.loyaltyPointsBalance ?? 0)}
      </Text>

      {status?.isActive ? <Text style={styles.active}>{PREMIUM_PAGE_UI.ACTIVE}</Text> : null}
      {feedback ? <Text style={styles.active}>{feedback}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {status?.canPurchase ? (
        <>
          {!hasEnoughPoints ? (
            <Text style={styles.error}>
              {PREMIUM_PAGE_UI.INSUFFICIENT_POINTS(
                status.pricePoints,
                status.loyaltyPointsBalance,
              )}
            </Text>
          ) : null}
          <Pressable
            style={[styles.button, (!hasEnoughPoints || purchaseMutation.isPending) && styles.disabled]}
            onPress={() => {
              void handlePurchase();
            }}
            disabled={!hasEnoughPoints || purchaseMutation.isPending}
          >
            {purchaseMutation.isPending ? (
              <ActivityIndicator color={theme.colors.onContrast} />
            ) : (
              <Text style={styles.buttonText}>{PREMIUM_PAGE_UI.SUBMIT}</Text>
            )}
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
};
