import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useRaffleCreateAdvertisingQuery } from "@/entities/raffle/model/useRaffleCreateAdvertisingQuery";
import { useUnlockRaffleCreateMutation } from "@/entities/raffle/model/useUnlockRaffleCreateMutation";
import { resolvePersonalCategoryStatusPanelStyle } from "@/features/advertising-page/lib/resolveAdvertisingStatusPanelStyle";
import { RAFFLE_ADVERTISING_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAdvertisingCardStyles } from "@/shared/theme/advertisingPageStyles";

type RaffleAdvertisingSectionProps = {
  loyaltyBalance: number;
};

const resolveRaffleStatusLabel = (status?: string | null) => {
  if (status === "pending_staff") return RAFFLE_ADVERTISING_PAGE_UI.STATUS_PENDING;
  if (status === "active") return RAFFLE_ADVERTISING_PAGE_UI.STATUS_ACTIVE;
  if (status === "paused") return RAFFLE_ADVERTISING_PAGE_UI.STATUS_PAUSED;
  return "";
};

export const RaffleAdvertisingSection = ({ loyaltyBalance }: RaffleAdvertisingSectionProps) => {
  const router = useRouter();
  const styles = useAdvertisingCardStyles();
  const statusQuery = useRaffleCreateAdvertisingQuery();
  const unlockMutation = useUnlockRaffleCreateMutation();
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  const openCreateForm = () => {
    router.push("/hub/create-raffle");
  };

  const handleUnlock = async () => {
    try {
      setActionError("");
      setFeedback("");
      await unlockMutation.mutateAsync();
      openCreateForm();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : RAFFLE_ADVERTISING_PAGE_UI.UNLOCK_FALLBACK,
      );
    }
  };

  if (statusQuery.isPending) {
    return (
      <View style={[styles.card, styles.cardCategory]}>
        <Text style={styles.cardTitle}>{RAFFLE_ADVERTISING_PAGE_UI.CARD_TITLE}</Text>
        <Text style={styles.state}>{RAFFLE_ADVERTISING_PAGE_UI.LOADING}</Text>
      </View>
    );
  }

  if (statusQuery.isError) {
    return (
      <View style={[styles.card, styles.cardCategory]}>
        <Text style={styles.cardTitle}>{RAFFLE_ADVERTISING_PAGE_UI.CARD_TITLE}</Text>
        <Text style={styles.error} accessibilityRole="alert">
          {formatApiErrorMessage(statusQuery.error, RAFFLE_ADVERTISING_PAGE_UI.FETCH_FALLBACK)}
        </Text>
      </View>
    );
  }

  const status = statusQuery.data;
  const pricePoints = status?.pricePoints ?? 3_000;
  const raffle = status?.raffle ?? null;
  const hasOpenRaffle = status?.hasOpenRaffle === true;
  const canOpenForm = status?.canOpenForm === true;
  const canPay = status?.canPay === true;
  const isSubmitting = unlockMutation.isPending;
  const insufficientPoints = !hasOpenRaffle && !canOpenForm && loyaltyBalance < pricePoints;
  const blockReason = status?.blockReason;

  return (
    <View style={[styles.card, styles.cardCategory]}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{RAFFLE_ADVERTISING_PAGE_UI.CARD_TITLE}</Text>
        <Text style={styles.cardBadge}>{RAFFLE_ADVERTISING_PAGE_UI.CARD_BADGE}</Text>
      </View>

      <Text style={styles.lead}>{RAFFLE_ADVERTISING_PAGE_UI.DESCRIPTION}</Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{RAFFLE_ADVERTISING_PAGE_UI.COST_LABEL}</Text>
          <Text style={styles.metaValue}>{RAFFLE_ADVERTISING_PAGE_UI.PRICE(pricePoints)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{RAFFLE_ADVERTISING_PAGE_UI.MODERATION_LABEL}</Text>
          <Text style={styles.metaValue}>{RAFFLE_ADVERTISING_PAGE_UI.MODERATION_VALUE}</Text>
        </View>
      </View>

      {raffle ? (
        <View style={resolvePersonalCategoryStatusPanelStyle(styles, String(raffle.status))}>
          <Text style={styles.statusText}>{resolveRaffleStatusLabel(String(raffle.status))}</Text>
        </View>
      ) : null}

      {!hasOpenRaffle && blockReason ? <Text style={styles.state}>{blockReason}</Text> : null}

      {insufficientPoints && !blockReason ? (
        <Text style={styles.state}>{RAFFLE_ADVERTISING_PAGE_UI.INSUFFICIENT_POINTS}</Text>
      ) : null}

      {canOpenForm ? (
        <Pressable style={styles.primaryButton} onPress={openCreateForm}>
          <Text style={styles.primaryButtonText}>{RAFFLE_ADVERTISING_PAGE_UI.CONTINUE_CREATE}</Text>
        </Pressable>
      ) : null}

      {canPay ? (
        <Pressable
          style={[styles.primaryButton, (isSubmitting || insufficientPoints) && styles.primaryButtonDisabled]}
          onPress={() => {
            void handleUnlock();
          }}
          disabled={isSubmitting || insufficientPoints}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {RAFFLE_ADVERTISING_PAGE_UI.PAY_AND_CREATE_WITH_PRICE(pricePoints)}
            </Text>
          )}
        </Pressable>
      ) : null}

      {actionError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {actionError}
        </Text>
      ) : null}

      {feedback ? (
        <Text style={styles.feedback} accessibilityRole="text">
          {feedback}
        </Text>
      ) : null}
    </View>
  );
};
