import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
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
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {PRODUCT_PROMOTION_UI.MODAL_SUBTITLE(productName)}
        </Text>

        <View
          style={[
            styles.balanceCard,
            {
              backgroundColor: hasEnoughFunds
                ? theme.colors.surfaceMuted
                : "#fef2f2",
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.balanceLabel, { color: theme.colors.textMuted }]}>
            {PRODUCT_PROMOTION_UI.BALANCE_LABEL}
          </Text>
          <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
            {PRODUCT_PROMOTION_UI.BALANCE_POINTS(loyaltyPoints)}
          </Text>
        </View>

        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {PRODUCT_PROMOTION_UI.PAYMENT_HINT_POINTS}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {PRODUCT_PROMOTION_UI.TIER_LABEL}
        </Text>
        <View style={styles.tierGrid}>
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.tier;
            const ratePercent = formatProductPromotionTierRatePercent(tier.tier);
            return (
              <Pressable
                key={tier.tier}
                style={[
                  styles.tierCard,
                  {
                    borderColor: isSelected ? theme.colors.nearBlack : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                disabled={isSubmitting}
                onPress={() => setSelectedTier(tier.tier)}
              >
                <Text style={[styles.tierBadge, { color: theme.colors.text }]}>
                  {TIER_BADGE_LABELS[tier.tier] ?? tier.title}
                </Text>
                <Text style={[styles.tierTitle, { color: theme.colors.text }]}>
                  {tier.title}
                </Text>
                {ratePercent ? (
                  <Text style={[styles.tierRate, { color: theme.colors.textMuted }]}>
                    {PRODUCT_PROMOTION_UI.TIER_RATE_HINT(ratePercent)}
                  </Text>
                ) : null}
                <Text style={[styles.tierDescription, { color: theme.colors.textMuted }]}>
                  {tier.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
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
                style={[
                  styles.durationChip,
                  {
                    borderColor: isSelected ? theme.colors.nearBlack : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                disabled={isSubmitting}
                onPress={() => setSelectedDurationCode(duration.code)}
              >
                <Text style={[styles.durationTitle, { color: theme.colors.text }]}>
                  {duration.title}
                </Text>
                <Text style={[styles.durationPrice, { color: theme.colors.textMuted }]}>
                  {PRODUCT_PROMOTION_UI.DURATION_PRICE_POINTS(pricePoints)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedDuration && selectedTierMeta ? (
          <View style={[styles.summary, { borderColor: theme.colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.textMuted }}>
                {PRODUCT_PROMOTION_UI.SUMMARY_TIER}
              </Text>
              <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
                {selectedTierMeta.title}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.textMuted }}>
                {PRODUCT_PROMOTION_UI.SUMMARY_DURATION}
              </Text>
              <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
                {PRODUCT_PROMOTION_UI.TARIFF_DURATION(selectedDuration.durationHours)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                {PRODUCT_PROMOTION_UI.TOTAL_LABEL}
              </Text>
              <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
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
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {PRODUCT_PROMOTION_UI.MODAL_TITLE}
          </Text>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {renderBody()}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={{ color: theme.colors.text }}>{PRODUCT_PROMOTION_UI.CANCEL}</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.colors.nearBlack }]}
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
                <ActivityIndicator color="#fff" />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  card: {
    maxHeight: "92%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    paddingBottom: 8,
    gap: 10,
  },
  subtitle: {
    fontSize: 14,
  },
  balanceCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  balanceLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  tierGrid: {
    gap: 8,
  },
  tierCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  tierBadge: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  tierRate: {
    fontSize: 12,
  },
  tierDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationChip: {
    minWidth: "30%",
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  durationTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  durationPrice: {
    fontSize: 12,
  },
  summary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButton: {
    flex: 1.4,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
