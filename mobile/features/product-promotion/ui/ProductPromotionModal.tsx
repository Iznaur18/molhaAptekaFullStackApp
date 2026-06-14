import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  calculateProductPromotionPointsCost,
  formatProductPromotionTierRatePercent,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "@/entities/product/lib/calculateProductPromotionPointsCost";
import type {
  ProductPromotionDuration,
  ProductPromotionTier,
} from "@/entities/product/api/fetchProductPromotionTariffs";
import { PRODUCT_CARD_UI, PRODUCT_PROMOTION_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductPromotionModalStyles } from "@/shared/theme/modalChromeStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const TIER_BADGE_LABELS: Record<number, string> = {
  [PRODUCT_PROMOTION_TIER_GOLD]: PRODUCT_CARD_UI.PROMOTED_BADGE,
  [PRODUCT_PROMOTION_TIER_TOP]: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE,
  [PRODUCT_PROMOTION_TIER_BANNER]: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE,
};

type ProductPromotionModalProps = {
  visible: boolean;
  productName: string;
  productPrice: number;
  tiers: ProductPromotionTier[];
  durations: ProductPromotionDuration[];
  loyaltyPoints: number;
  isTariffsLoading?: boolean;
  tariffsError?: Error | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onRetryTariffs?: () => void;
  onClose: () => void;
  onSubmit: (tier: number, tariffCode: string) => void | Promise<void>;
};

export const ProductPromotionModal = ({
  visible,
  productName,
  productPrice,
  tiers,
  durations,
  loyaltyPoints,
  isTariffsLoading = false,
  tariffsError = null,
  isSubmitting = false,
  errorMessage = "",
  onRetryTariffs,
  onClose,
  onSubmit,
}: ProductPromotionModalProps) => {
  const styles = useProductPromotionModalStyles();
  const theme = useAppTheme();
  const defaultTier = tiers[0]?.tier ?? PRODUCT_PROMOTION_TIER_GOLD;
  const defaultDuration = durations[0]?.code ?? "";
  const [selectedTier, setSelectedTier] = useState(defaultTier);
  const [selectedDurationCode, setSelectedDurationCode] = useState(defaultDuration);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setSelectedTier(defaultTier);
    setSelectedDurationCode(defaultDuration);
  }, [defaultDuration, defaultTier, visible]);

  const selectedDuration = useMemo(
    () => durations.find((item) => item.code === selectedDurationCode) ?? null,
    [durations, selectedDurationCode],
  );

  const selectedTierMeta = useMemo(
    () => tiers.find((item) => item.tier === selectedTier) ?? null,
    [selectedTier, tiers],
  );

  const selectedPricePoints = useMemo(() => {
    if (!selectedDuration) {
      return 0;
    }
    return calculateProductPromotionPointsCost({
      productPrice,
      tier: selectedTier,
      durationCode: selectedDuration.code,
    });
  }, [productPrice, selectedDuration, selectedTier]);

  const hasEnoughFunds = loyaltyPoints >= selectedPricePoints;
  const insufficientMessage =
    selectedDuration && !hasEnoughFunds
      ? PRODUCT_PROMOTION_UI.INSUFFICIENT_POINTS(selectedPricePoints, loyaltyPoints)
      : "";

  const handleSubmit = () => {
    if (!selectedDuration || isSubmitting || !hasEnoughFunds || tiers.length === 0) {
      return;
    }
    void onSubmit(selectedTier, selectedDuration.code);
  };

  const renderBody = () => {
    if (isTariffsLoading) {
      return <ScreenLoadingState message={PRODUCT_PROMOTION_UI.LOADING_TARIFFS} />;
    }

    if (tariffsError) {
      return (
        <ScreenErrorState
          message={tariffsError.message}
          onRetry={onRetryTariffs}
        />
      );
    }

    return (
      <>
        <Text style={styles.subtitle}>
          {PRODUCT_PROMOTION_UI.MODAL_SUBTITLE(productName)}
        </Text>

        <View
          style={[
            styles.balanceCard,
            hasEnoughFunds ? styles.balanceCardOk : styles.balanceCardInsufficient,
          ]}
        >
          <Text style={styles.balanceLabel}>
            {PRODUCT_PROMOTION_UI.BALANCE_LABEL}
          </Text>
          <Text style={styles.balanceValue}>
            {PRODUCT_PROMOTION_UI.BALANCE_POINTS(loyaltyPoints)}
          </Text>
        </View>

        <Text style={styles.hint}>
          {PRODUCT_PROMOTION_UI.PAYMENT_HINT_POINTS}
        </Text>

        <Text style={styles.sectionTitle}>
          {PRODUCT_PROMOTION_UI.TIER_LABEL}
        </Text>
        <View style={styles.tierGrid}>
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.tier;
            const ratePercent = formatProductPromotionTierRatePercent(tier.tier);
            return (
              <Pressable
                key={tier.tier}
                style={[styles.tierCard, isSelected && styles.tierCardSelected]}
                disabled={isSubmitting}
                onPress={() => setSelectedTier(tier.tier)}
              >
                <Text style={styles.tierBadge}>
                  {TIER_BADGE_LABELS[tier.tier] ?? tier.title}
                </Text>
                <Text style={styles.tierTitle}>
                  {tier.title}
                </Text>
                {ratePercent ? (
                  <Text style={styles.tierRate}>
                    {PRODUCT_PROMOTION_UI.TIER_RATE_HINT(ratePercent)}
                  </Text>
                ) : null}
                <Text style={styles.tierDescription}>
                  {tier.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>
          {PRODUCT_PROMOTION_UI.DURATION_LABEL}
        </Text>
        <View style={styles.durationRow}>
          {durations.map((duration) => {
            const pricePoints = calculateProductPromotionPointsCost({
              productPrice,
              tier: selectedTier,
              durationCode: duration.code,
            });
            const isSelected = selectedDurationCode === duration.code;
            return (
              <Pressable
                key={duration.code}
                style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                disabled={isSubmitting}
                onPress={() => setSelectedDurationCode(duration.code)}
              >
                <Text style={styles.durationTitle}>
                  {duration.title}
                </Text>
                <Text style={styles.durationPrice}>
                  {PRODUCT_PROMOTION_UI.DURATION_PRICE_POINTS(pricePoints)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedDuration && selectedTierMeta ? (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {PRODUCT_PROMOTION_UI.SUMMARY_TIER}
              </Text>
              <Text style={styles.summaryValueStrong}>
                {selectedTierMeta.title}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {PRODUCT_PROMOTION_UI.SUMMARY_DURATION}
              </Text>
              <Text style={styles.summaryValueStrong}>
                {PRODUCT_PROMOTION_UI.TARIFF_DURATION(selectedDuration.durationHours)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryValueBold}>
                {PRODUCT_PROMOTION_UI.TOTAL_LABEL}
              </Text>
              <Text style={styles.summaryValueBold}>
                {PRODUCT_PROMOTION_UI.TOTAL_POINTS(selectedPricePoints)}
              </Text>
            </View>
          </View>
        ) : null}

        {insufficientMessage ? (
          <Text style={styles.error}>{insufficientMessage}</Text>
        ) : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {PRODUCT_PROMOTION_UI.MODAL_TITLE}
          </Text>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {renderBody()}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>{PRODUCT_PROMOTION_UI.CANCEL}</Text>
            </Pressable>
            <Pressable
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={
                isTariffsLoading ||
                Boolean(tariffsError) ||
                !selectedDuration ||
                isSubmitting ||
                !hasEnoughFunds ||
                tiers.length === 0
              }
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.onContrast} />
              ) : (
                <Text style={styles.primaryButtonText}>{PRODUCT_PROMOTION_UI.SUBMIT_POINTS}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
