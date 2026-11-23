import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useMyLuckyBoxConfigQuery } from "@/entities/seller-lucky-box/model/useMyLuckyBoxConfigQuery";
import { usePutMyLuckyBoxConfigMutation } from "@/entities/seller-lucky-box/model/usePutMyLuckyBoxConfigMutation";
import { LUCKY_BOX_ADVERTISING_UI as UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAdvertisingCardStyles } from "@/shared/theme/advertisingPageStyles";
import { useAdvertisingGameAdminStyles } from "@/shared/theme/advertisingGameAdminStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

const BOXES_TOTAL = 6;
const PRIZES_MIN = 1;
const PRIZES_MAX = 4;
const DEFAULT_PRIZE = { discountPercent: 10, durationHours: 24, enabled: true };
const DISCOUNT_CHOICES = [5, 10, 15, 20, 25, 30];

type PrizeDraft = {
  discountPercent: string;
  durationHours: string;
  prizeProductId: string;
  enabled: boolean;
};

function normalizePrizeDraft(
  prize: {
    discountPercent?: unknown;
    durationHours?: unknown;
    prizeProductId?: unknown;
    enabled?: unknown;
  } | null
  | undefined,
): PrizeDraft {
  return {
    discountPercent: String(
      Math.floor(Number(prize?.discountPercent)) || DEFAULT_PRIZE.discountPercent,
    ),
    durationHours: String(
      Math.floor(Number(prize?.durationHours)) || DEFAULT_PRIZE.durationHours,
    ),
    prizeProductId:
      typeof prize?.prizeProductId === "string" ? prize.prizeProductId : "",
    enabled: prize?.enabled !== false,
  };
}

function matchBuilderShape(
  prizes: Array<{
    discountPercent?: unknown;
    durationHours?: unknown;
    prizeProductId?: unknown;
    enabled?: unknown;
  }> | null
  | undefined,
): number[] | null {
  if (!Array.isArray(prizes) || prizes.length < PRIZES_MIN || prizes.length > PRIZES_MAX) {
    return null;
  }
  const simple = prizes.every(
    (prize) =>
      prize?.enabled !== false &&
      !prize?.prizeProductId &&
      Math.floor(Number(prize?.durationHours)) === DEFAULT_PRIZE.durationHours,
  );
  if (!simple) {
    return null;
  }
  return prizes.map(
    (prize) =>
      Math.floor(Number(prize?.discountPercent)) || DEFAULT_PRIZE.discountPercent,
  );
}

export const LuckyBoxAdvertisingSection = () => {
  const theme = useAppTheme();
  const cardStyles = useAdvertisingCardStyles();
  const adminStyles = useAdvertisingGameAdminStyles();
  const configQuery = useMyLuckyBoxConfigQuery();
  const saveMutation = usePutMyLuckyBoxConfigMutation();

  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"builder" | "advanced">("builder");
  const [prizeDiscounts, setPrizeDiscounts] = useState(() => [10, 15]);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [prizeDrafts, setPrizeDrafts] = useState<PrizeDraft[]>(() => [
    normalizePrizeDraft(null),
    normalizePrizeDraft(null),
  ]);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const config = configQuery.data;
    if (!config) {
      return;
    }
    setEnabled(config.enabled === true);
    const discounts = matchBuilderShape(config.prizes);
    if (discounts) {
      setPrizeDiscounts(discounts);
      setSelectedBox(null);
      setMode("builder");
      return;
    }
    const loaded = (config.prizes ?? []).map(normalizePrizeDraft);
    setPrizeDrafts(
      loaded.length > 0
        ? loaded
        : [normalizePrizeDraft(null), normalizePrizeDraft(null)],
    );
    setMode("advanced");
  }, [configQuery.data]);

  const handleBoxClick = (index: number) => {
    if (index < prizeDiscounts.length) {
      setSelectedBox(index);
      return;
    }
    if (prizeDiscounts.length >= PRIZES_MAX) {
      return;
    }
    setPrizeDiscounts((current) => [...current, DEFAULT_PRIZE.discountPercent]);
    setSelectedBox(prizeDiscounts.length);
  };

  const handlePaletteDiscount = (value: number) => {
    if (selectedBox === null || selectedBox >= prizeDiscounts.length) {
      return;
    }
    setPrizeDiscounts((current) =>
      current.map((discount, index) => (index === selectedBox ? value : discount)),
    );
  };

  const handlePaletteEmpty = () => {
    if (selectedBox === null || prizeDiscounts.length <= PRIZES_MIN) {
      return;
    }
    setPrizeDiscounts((current) => current.filter((_, index) => index !== selectedBox));
    setSelectedBox(null);
  };

  const handlePrizesCountChange = (count: number) => {
    setPrizeDrafts((current) => {
      if (count <= current.length) {
        return current.slice(0, count);
      }
      const next = [...current];
      while (next.length < count) {
        next.push(normalizePrizeDraft(null));
      }
      return next;
    });
  };

  const handlePrizeChange = (
    index: number,
    field: keyof PrizeDraft,
    value: string | boolean,
  ) => {
    setPrizeDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, [field]: value } : draft,
      ),
    );
  };

  const switchToAdvanced = () => {
    setPrizeDrafts(
      prizeDiscounts.map((discount) =>
        normalizePrizeDraft({ discountPercent: discount }),
      ),
    );
    setMode("advanced");
  };

  const switchToBuilder = () => {
    setPrizeDiscounts(
      prizeDrafts.map(
        (draft) =>
          Math.floor(Number(draft.discountPercent)) || DEFAULT_PRIZE.discountPercent,
      ),
    );
    setSelectedBox(null);
    setMode("builder");
  };

  const buildPrizesPayload = () =>
    mode === "builder"
      ? prizeDiscounts.map((discount) => ({
          discountPercent: discount,
          durationHours: DEFAULT_PRIZE.durationHours,
          prizeProductId: null as string | null,
          enabled: true,
        }))
      : prizeDrafts.map((draft) => ({
          discountPercent: Math.floor(Number(draft.discountPercent)) || 0,
          durationHours: Math.floor(Number(draft.durationHours)) || 0,
          prizeProductId: draft.prizeProductId.trim() || null,
          enabled: draft.enabled,
        }));

  const handleSave = async () => {
    setActionError("");
    setFeedback("");
    try {
      await saveMutation.mutateAsync({
        enabled,
        prizes: buildPrizesPayload(),
      });
      setFeedback(UI.SAVE_SUCCESS);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : UI.SAVE_FALLBACK);
    }
  };

  const config = configQuery.data;
  const paletteChoices = [
    ...DISCOUNT_CHOICES,
    ...prizeDiscounts.filter((value) => !DISCOUNT_CHOICES.includes(value)),
  ];
  const selectedIsPrize =
    selectedBox !== null && selectedBox < prizeDiscounts.length;

  return (
    <View style={[cardStyles.card, cardStyles.cardCategory]}>
      <View style={cardStyles.cardHead}>
        <Text style={cardStyles.cardTitle}>{UI.CARD_TITLE}</Text>
        <Text style={cardStyles.cardBadge}>{UI.CARD_BADGE}</Text>
      </View>
      <Text style={cardStyles.lead}>{UI.DESCRIPTION}</Text>

      {configQuery.isPending ? (
        <Text style={cardStyles.state}>{UI.LOADING}</Text>
      ) : null}

      {configQuery.isError ? (
        <Text style={cardStyles.error} accessibilityRole="alert">
          {formatApiErrorMessage(configQuery.error, UI.FETCH_FALLBACK)}
        </Text>
      ) : null}

      {config ? (
        <View style={adminStyles.form}>
          <View style={adminStyles.toggleRow}>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.action,
              }}
              thumbColor={theme.colors.onContrast}
              accessibilityLabel={UI.ENABLED_LABEL}
            />
            <Text style={adminStyles.toggleLabel}>{UI.ENABLED_LABEL}</Text>
          </View>

          {mode === "builder" ? (
            <>
              <Text style={adminStyles.builderHint}>{UI.BUILDER_HINT}</Text>
              <View style={adminStyles.boxesGrid} accessibilityRole="none">
                {Array.from({ length: BOXES_TOTAL }, (_, index) => {
                  const isPrize = index < prizeDiscounts.length;
                  return (
                    <Pressable
                      key={index}
                      style={adminStyles.boxCell}
                      accessibilityLabel={
                        isPrize
                          ? UI.BUILDER_BOX_PRIZE_ARIA(index, prizeDiscounts[index])
                          : UI.BUILDER_BOX_EMPTY_ARIA(index)
                      }
                      onPress={() => handleBoxClick(index)}
                    >
                      <View
                        style={[
                          adminStyles.box,
                          isPrize ? adminStyles.boxPrize : null,
                          selectedBox === index ? adminStyles.boxSelected : null,
                        ]}
                      >
                        <Feather
                          name="gift"
                          size={28}
                          color={isPrize ? theme.colors.action : theme.colors.textMuted}
                        />
                        {isPrize ? (
                          <>
                            <Text style={adminStyles.boxDiscount}>
                              {prizeDiscounts[index]}%
                            </Text>
                            <Text style={[adminStyles.boxSub, adminStyles.boxSubPrize]}>
                              {UI.BUILDER_PRIZE_FACE_LABEL}
                            </Text>
                          </>
                        ) : (
                          <Text style={adminStyles.boxSub}>
                            {UI.BUILDER_EMPTY_FACE_LABEL}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {selectedIsPrize ? (
                <>
                  <Text style={adminStyles.paletteLabel}>
                    {UI.BUILDER_PALETTE_LABEL}
                  </Text>
                  <View style={adminStyles.chipsRow}>
                    {paletteChoices.map((value) => {
                      const active = prizeDiscounts[selectedBox] === value;
                      return (
                        <Pressable
                          key={value}
                          style={[adminStyles.chip, active ? adminStyles.chipActive : null]}
                          onPress={() => handlePaletteDiscount(value)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                        >
                          <Text
                            style={[
                              adminStyles.chipLabel,
                              active ? adminStyles.chipLabelActive : null,
                            ]}
                          >
                            {value}%
                          </Text>
                        </Pressable>
                      );
                    })}
                    <Pressable
                      style={[
                        adminStyles.chip,
                        prizeDiscounts.length <= PRIZES_MIN
                          ? adminStyles.chipDisabled
                          : null,
                      ]}
                      disabled={prizeDiscounts.length <= PRIZES_MIN}
                      onPress={handlePaletteEmpty}
                    >
                      <Text style={adminStyles.chipLabel}>{UI.BUILDER_EMPTY_CHIP}</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <Text style={adminStyles.paletteLabel}>{UI.BUILDER_SELECT_BOX}</Text>
              )}

              <Text style={adminStyles.builderNote}>{UI.BUILDER_NOTE}</Text>
            </>
          ) : (
            <>
              <View style={adminStyles.countRow}>
                <Text style={adminStyles.countLabel}>{UI.PRIZES_COUNT_LABEL}</Text>
                <View style={adminStyles.chipsRow}>
                  {Array.from(
                    { length: PRIZES_MAX - PRIZES_MIN + 1 },
                    (_, offset) => PRIZES_MIN + offset,
                  ).map((count) => {
                    const active = prizeDrafts.length === count;
                    return (
                      <Pressable
                        key={count}
                        style={[adminStyles.chip, active ? adminStyles.chipActive : null]}
                        onPress={() => handlePrizesCountChange(count)}
                        accessibilityState={{ selected: active }}
                      >
                        <Text
                          style={[
                            adminStyles.chipLabel,
                            active ? adminStyles.chipLabelActive : null,
                          ]}
                        >
                          {count}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {prizeDrafts.map((draft, index) => (
                <View
                  key={index}
                  style={[
                    adminStyles.prizeBlock,
                    !draft.enabled ? adminStyles.prizeBlockDisabled : null,
                  ]}
                >
                  <View style={adminStyles.prizeHead}>
                    <Text
                      style={[
                        adminStyles.prizeTitle,
                        !draft.enabled ? adminStyles.prizeTitleMuted : null,
                      ]}
                    >
                      {UI.PRIZE_TITLE(index)}
                    </Text>
                    <Switch
                      value={draft.enabled}
                      onValueChange={(next) => handlePrizeChange(index, "enabled", next)}
                      trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.action,
                      }}
                      thumbColor={theme.colors.onContrast}
                      accessibilityLabel={UI.PRIZE_TOGGLE_ARIA(index)}
                    />
                  </View>
                  <View
                    style={[
                      adminStyles.prizeFields,
                      !draft.enabled ? adminStyles.prizeFieldsFaded : null,
                    ]}
                  >
                    <View style={adminStyles.adminField}>
                      <Text style={adminStyles.adminFieldLabel}>{UI.DISCOUNT_LABEL}</Text>
                      <TextInput
                        style={adminStyles.adminInput}
                        keyboardType="number-pad"
                        editable={draft.enabled}
                        value={draft.discountPercent}
                        onChangeText={(value) =>
                          handlePrizeChange(index, "discountPercent", value)
                        }
                      />
                      <Text style={adminStyles.adminFieldHint}>{UI.DISCOUNT_HINT}</Text>
                    </View>
                    <View style={adminStyles.adminField}>
                      <Text style={adminStyles.adminFieldLabel}>{UI.DURATION_LABEL}</Text>
                      <TextInput
                        style={adminStyles.adminInput}
                        keyboardType="number-pad"
                        editable={draft.enabled}
                        value={draft.durationHours}
                        onChangeText={(value) =>
                          handlePrizeChange(index, "durationHours", value)
                        }
                      />
                      <Text style={adminStyles.adminFieldHint}>{UI.DURATION_HINT}</Text>
                    </View>
                    <View style={adminStyles.adminField}>
                      <Text style={adminStyles.adminFieldLabel}>
                        {UI.PRIZE_PRODUCT_LABEL}
                      </Text>
                      <TextInput
                        style={adminStyles.adminInput}
                        editable={draft.enabled}
                        placeholder={UI.PRIZE_PRODUCT_PLACEHOLDER}
                        value={draft.prizeProductId}
                        onChangeText={(value) =>
                          handlePrizeChange(index, "prizeProductId", value)
                        }
                      />
                      <Text style={adminStyles.adminFieldHint}>
                        {UI.PRIZE_PRODUCT_HINT}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          <Pressable
            style={adminStyles.modeSwitch}
            onPress={mode === "builder" ? switchToAdvanced : switchToBuilder}
          >
            <Text style={adminStyles.modeSwitchText}>
              {mode === "builder" ? UI.MODE_ADVANCED : UI.MODE_BUILDER}
            </Text>
          </Pressable>

          <Text style={adminStyles.stats}>
            {UI.STATS(config.playsTotal ?? 0, config.winsTotal ?? 0)}
          </Text>

          <View style={cardStyles.actions}>
            <Pressable
              style={[
                cardStyles.primaryButton,
                saveMutation.isPending ? cardStyles.primaryButtonDisabled : null,
              ]}
              disabled={saveMutation.isPending}
              onPress={handleSave}
            >
              {saveMutation.isPending ? (
                <ActivityIndicator color={theme.colors.onContrast} />
              ) : (
                <Text style={cardStyles.primaryButtonText}>{UI.SAVE}</Text>
              )}
            </Pressable>
          </View>

          {actionError ? (
            <Text style={cardStyles.error} accessibilityRole="alert">
              {actionError}
            </Text>
          ) : null}
          {feedback ? (
            <Text style={cardStyles.feedback} accessibilityLiveRegion="polite">
              {feedback}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};