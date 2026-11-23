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
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

import { mixHexWithWhite } from "@/entities/seller-fortune-wheel/lib/mixHexColors";
import { useMyFortuneWheelConfigQuery } from "@/entities/seller-fortune-wheel/model/useMyFortuneWheelConfigQuery";
import { usePutMyFortuneWheelConfigMutation } from "@/entities/seller-fortune-wheel/model/usePutMyFortuneWheelConfigMutation";
import { FORTUNE_WHEEL_ADVERTISING_UI as UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAdvertisingCardStyles } from "@/shared/theme/advertisingPageStyles";
import { useAdvertisingGameAdminStyles } from "@/shared/theme/advertisingGameAdminStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

const SECTORS_MIN = 2;
const SECTORS_MAX = 8;
const CHANCE_TOTAL = 100;
const DEFAULT_SECTOR = { discountPercent: 10, durationHours: 24, enabled: true };
const DISCOUNT_CHOICES = [5, 10, 15, 20, 25, 30];

const VIEW_SIZE = 200;
const CENTER = VIEW_SIZE / 2;
const WHEEL_RADIUS = 96;
const TEXT_RADIUS = 62;

function polarToPoint(radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function sectorPath(startDeg: number, endDeg: number) {
  const start = polarToPoint(WHEEL_RADIUS, startDeg);
  const end = polarToPoint(WHEEL_RADIUS, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

type SectorDraft = {
  discountPercent: string;
  durationHours: string;
  chancePercent: string;
  prizeProductId: string;
  enabled: boolean;
};

function normalizeSectorDraft(
  sector: {
    discountPercent?: unknown;
    durationHours?: unknown;
    chancePercent?: unknown;
    prizeProductId?: unknown;
    enabled?: unknown;
  } | null
  | undefined,
): SectorDraft {
  return {
    discountPercent: String(
      Math.floor(Number(sector?.discountPercent)) || DEFAULT_SECTOR.discountPercent,
    ),
    durationHours: String(
      Math.floor(Number(sector?.durationHours)) || DEFAULT_SECTOR.durationHours,
    ),
    chancePercent: String(Math.floor(Number(sector?.chancePercent)) || 0),
    prizeProductId:
      typeof sector?.prizeProductId === "string" ? sector.prizeProductId : "",
    enabled: sector?.enabled !== false,
  };
}

function evenChances(count: number) {
  const base = Math.floor(CHANCE_TOTAL / count);
  const remainder = CHANCE_TOTAL - base * count;
  return Array.from(
    { length: count },
    (_, index) => base + (index === 0 ? remainder : 0),
  );
}

function matchBuilderShape(
  sectors: Array<{
    discountPercent?: unknown;
    durationHours?: unknown;
    chancePercent?: unknown;
    prizeProductId?: unknown;
    enabled?: unknown;
  }> | null
  | undefined,
): Array<{ discount: number | null }> | null {
  if (!Array.isArray(sectors) || sectors.length < SECTORS_MIN || sectors.length > SECTORS_MAX) {
    return null;
  }
  const baseOk = sectors.every(
    (sector) =>
      !sector?.prizeProductId &&
      Math.floor(Number(sector?.durationHours)) === DEFAULT_SECTOR.durationHours,
  );
  if (!baseOk) {
    return null;
  }
  const expected = evenChances(sectors.length);
  const chancesOk = sectors.every(
    (sector, index) =>
      (Math.floor(Number(sector?.chancePercent)) || 0) === expected[index],
  );
  if (!chancesOk) {
    return null;
  }
  const shape = sectors.map((sector) => ({
    discount:
      sector?.enabled === false
        ? null
        : Math.floor(Number(sector?.discountPercent)) || DEFAULT_SECTOR.discountPercent,
  }));
  if (!shape.some((sector) => sector.discount !== null)) {
    return null;
  }
  return shape;
}

export const FortuneWheelAdvertisingSection = () => {
  const theme = useAppTheme();
  const cardStyles = useAdvertisingCardStyles();
  const adminStyles = useAdvertisingGameAdminStyles();
  const configQuery = useMyFortuneWheelConfigQuery();
  const saveMutation = usePutMyFortuneWheelConfigMutation();

  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"builder" | "advanced">("builder");
  const [sectorsSimple, setSectorsSimple] = useState(() => [
    { discount: 10 as number | null },
    { discount: 15 as number | null },
    { discount: null as number | null },
  ]);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [sectorDrafts, setSectorDrafts] = useState<SectorDraft[]>(() => {
    const drafts = Array.from({ length: 4 }, () => normalizeSectorDraft(null));
    evenChances(4).forEach((chance, index) => {
      drafts[index].chancePercent = String(chance);
    });
    return drafts;
  });
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const config = configQuery.data;
    if (!config) {
      return;
    }
    setEnabled(config.enabled === true);
    const shape = matchBuilderShape(config.sectors);
    if (shape) {
      setSectorsSimple(shape);
      setSelectedSector(null);
      setMode("builder");
      return;
    }
    const loaded = (config.sectors ?? []).map(normalizeSectorDraft);
    if (loaded.length > 0) {
      setSectorDrafts(loaded);
    }
    setMode("advanced");
  }, [configQuery.data]);

  const prizesCount = sectorsSimple.filter((sector) => sector.discount !== null).length;
  const selectedIsPrize =
    selectedSector !== null && sectorsSimple[selectedSector]?.discount !== null;

  const handlePaletteDiscount = (value: number) => {
    if (selectedSector === null) {
      return;
    }
    setSectorsSimple((current) =>
      current.map((sector, index) =>
        index === selectedSector ? { discount: value } : sector,
      ),
    );
  };

  const handlePaletteEmpty = () => {
    if (selectedSector === null || prizesCount <= 1) {
      return;
    }
    setSectorsSimple((current) =>
      current.map((sector, index) =>
        index === selectedSector ? { discount: null } : sector,
      ),
    );
  };

  const handleAddSector = () => {
    if (sectorsSimple.length >= SECTORS_MAX) {
      return;
    }
    setSectorsSimple((current) => [
      ...current,
      { discount: DEFAULT_SECTOR.discountPercent },
    ]);
    setSelectedSector(sectorsSimple.length);
  };

  const handleRemoveSector = () => {
    if (selectedSector === null || sectorsSimple.length <= SECTORS_MIN) {
      return;
    }
    const wasPrize = sectorsSimple[selectedSector]?.discount !== null;
    if (wasPrize && prizesCount <= 1) {
      return;
    }
    setSectorsSimple((current) =>
      current.filter((_, index) => index !== selectedSector),
    );
    setSelectedSector(null);
  };

  const handleSectorsCountChange = (count: number) => {
    setSectorDrafts((current) => {
      const next =
        count <= current.length
          ? current.slice(0, count)
          : [
              ...current,
              ...Array.from({ length: count - current.length }, () =>
                normalizeSectorDraft(null),
              ),
            ];
      const chances = evenChances(count);
      return next.map((draft, index) => ({
        ...draft,
        chancePercent: String(chances[index]),
      }));
    });
  };

  const handleSectorChange = (
    index: number,
    field: keyof SectorDraft,
    value: string | boolean,
  ) => {
    setSectorDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, [field]: value } : draft,
      ),
    );
  };

  const switchToAdvanced = () => {
    const chances = evenChances(sectorsSimple.length);
    setSectorDrafts(
      sectorsSimple.map((sector, index) =>
        normalizeSectorDraft({
          discountPercent: sector.discount ?? DEFAULT_SECTOR.discountPercent,
          chancePercent: chances[index],
          enabled: sector.discount !== null,
        }),
      ),
    );
    setMode("advanced");
  };

  const switchToBuilder = () => {
    setSectorsSimple(
      sectorDrafts.map((draft) => ({
        discount: draft.enabled
          ? Math.floor(Number(draft.discountPercent)) || DEFAULT_SECTOR.discountPercent
          : null,
      })),
    );
    setSelectedSector(null);
    setMode("builder");
  };

  const buildSectorsPayload = () => {
    if (mode === "builder") {
      const chances = evenChances(sectorsSimple.length);
      return sectorsSimple.map((sector, index) => ({
        discountPercent: sector.discount ?? DEFAULT_SECTOR.discountPercent,
        durationHours: DEFAULT_SECTOR.durationHours,
        chancePercent: chances[index],
        prizeProductId: null as string | null,
        enabled: sector.discount !== null,
      }));
    }
    return sectorDrafts.map((draft) => ({
      discountPercent: Math.floor(Number(draft.discountPercent)) || 0,
      durationHours: Math.floor(Number(draft.durationHours)) || 0,
      chancePercent: Math.floor(Number(draft.chancePercent)) || 0,
      prizeProductId: draft.prizeProductId.trim() || null,
      enabled: draft.enabled,
    }));
  };

  const chanceTotal = sectorDrafts.reduce(
    (total, draft) => total + (Math.floor(Number(draft.chancePercent)) || 0),
    0,
  );
  const chanceTotalOk = chanceTotal === CHANCE_TOTAL;

  const handleSave = async () => {
    setActionError("");
    setFeedback("");
    try {
      await saveMutation.mutateAsync({
        enabled,
        sectors: buildSectorsPayload(),
      });
      setFeedback(UI.SAVE_SUCCESS);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : UI.SAVE_FALLBACK);
    }
  };

  const config = configQuery.data;
  const paletteChoices = [
    ...DISCOUNT_CHOICES,
    ...sectorsSimple
      .map((sector) => sector.discount)
      .filter((value): value is number => value !== null && !DISCOUNT_CHOICES.includes(value)),
  ].sort((a, b) => a - b);
  const sectorAngle = 360 / sectorsSimple.length;
  const chancePerSector = Math.round(CHANCE_TOTAL / sectorsSimple.length);
  const oddFill = mixHexWithWhite(theme.colors.action, 0.42);

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

              <View style={adminStyles.wheelStage}>
                <View style={adminStyles.wheelPointer} />
                <View style={adminStyles.wheelSvgWrap}>
                  <Svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
                    accessibilityLabel={UI.CARD_TITLE}
                  >
                    {sectorsSimple.map((sector, index) => {
                      const startDeg = index * sectorAngle;
                      const endDeg = startDeg + sectorAngle;
                      const midDeg = startDeg + sectorAngle / 2;
                      const labelPoint = polarToPoint(TEXT_RADIUS, midDeg);
                      const isPrize = sector.discount !== null;
                      const fill = isPrize
                        ? index % 2 === 0
                          ? theme.colors.action
                          : oddFill
                        : theme.colors.surfaceMuted;
                      const labelFill = isPrize
                        ? index % 2 === 0
                          ? theme.colors.onContrast
                          : theme.colors.ink
                        : theme.colors.textMuted;
                      const selected = selectedSector === index;
                      return (
                        <G key={index}>
                          <Path
                            d={sectorPath(startDeg, endDeg)}
                            fill={fill}
                            stroke={selected ? theme.colors.ink : theme.colors.surface}
                            strokeWidth={selected ? 2.5 : 1.5}
                            onPress={() => setSelectedSector(index)}
                          />
                          <SvgText
                            x={labelPoint.x.toFixed(2)}
                            y={labelPoint.y.toFixed(2)}
                            fill={labelFill}
                            fontSize={isPrize ? 11 : 9}
                            fontWeight={isPrize ? "800" : "600"}
                            textAnchor="middle"
                            alignmentBaseline="central"
                            transform={`rotate(${midDeg} ${labelPoint.x.toFixed(2)} ${labelPoint.y.toFixed(2)})`}
                          >
                            {isPrize ? `${sector.discount}%` : UI.BUILDER_EMPTY_CHIP}
                          </SvgText>
                        </G>
                      );
                    })}
                    <Circle
                      cx={CENTER}
                      cy={CENTER}
                      r={30}
                      fill={theme.colors.surface}
                      stroke={theme.colors.border}
                      strokeWidth={1.5}
                    />
                  </Svg>
                </View>
              </View>

              <Text style={adminStyles.chanceInfo}>
                {UI.BUILDER_CHANCE_INFO(chancePerSector)}
              </Text>

              {selectedSector !== null ? (
                <>
                  <Text style={adminStyles.paletteLabel}>
                    {UI.BUILDER_PALETTE_LABEL(selectedSector)}
                  </Text>
                  <View style={adminStyles.chipsRow}>
                    {paletteChoices.map((value) => {
                      const active = sectorsSimple[selectedSector]?.discount === value;
                      return (
                        <Pressable
                          key={value}
                          style={[adminStyles.chip, active ? adminStyles.chipActive : null]}
                          onPress={() => handlePaletteDiscount(value)}
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
                        selectedIsPrize && prizesCount <= 1 ? adminStyles.chipDisabled : null,
                        !selectedIsPrize ? adminStyles.chipActive : null,
                      ]}
                      disabled={selectedIsPrize && prizesCount <= 1}
                      onPress={handlePaletteEmpty}
                    >
                      <Text
                        style={[
                          adminStyles.chipLabel,
                          !selectedIsPrize ? adminStyles.chipLabelActive : null,
                        ]}
                      >
                        {UI.BUILDER_EMPTY_CHIP}
                      </Text>
                    </Pressable>
                  </View>
                  {sectorsSimple.length > SECTORS_MIN ? (
                    <Pressable
                      style={[
                        adminStyles.linkButton,
                        selectedIsPrize && prizesCount <= 1
                          ? adminStyles.linkButtonDisabled
                          : null,
                      ]}
                      disabled={selectedIsPrize && prizesCount <= 1}
                      onPress={handleRemoveSector}
                    >
                      <Text style={adminStyles.linkButtonText}>
                        {UI.BUILDER_REMOVE_SECTOR}
                      </Text>
                    </Pressable>
                  ) : null}
                </>
              ) : (
                <Text style={adminStyles.paletteLabel}>{UI.BUILDER_SELECT_SECTOR}</Text>
              )}

              {sectorsSimple.length < SECTORS_MAX ? (
                <Pressable style={adminStyles.linkButton} onPress={handleAddSector}>
                  <Text style={adminStyles.linkButtonText}>{UI.BUILDER_ADD_SECTOR}</Text>
                </Pressable>
              ) : null}

              <Text style={adminStyles.builderNote}>{UI.BUILDER_NOTE}</Text>
            </>
          ) : (
            <>
              <View style={adminStyles.countRow}>
                <Text style={adminStyles.countLabel}>{UI.SECTORS_COUNT_LABEL}</Text>
                <View style={adminStyles.chipsRow}>
                  {Array.from(
                    { length: SECTORS_MAX - SECTORS_MIN + 1 },
                    (_, offset) => SECTORS_MIN + offset,
                  ).map((count) => {
                    const active = sectorDrafts.length === count;
                    return (
                      <Pressable
                        key={count}
                        style={[adminStyles.chip, active ? adminStyles.chipActive : null]}
                        onPress={() => handleSectorsCountChange(count)}
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

              {sectorDrafts.map((draft, index) => (
                <View
                  key={index}
                  style={[
                    adminStyles.prizeBlock,
                    !draft.enabled ? adminStyles.prizeBlockDisabled : null,
                  ]}
                >
                  <View style={adminStyles.prizeHead}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                      <Feather
                        name="gift"
                        size={14}
                        color={
                          draft.enabled ? theme.colors.action : theme.colors.textMuted
                        }
                      />
                      <Text
                        style={[
                          adminStyles.prizeTitle,
                          !draft.enabled ? adminStyles.prizeTitleMuted : null,
                        ]}
                      >
                        {UI.SECTOR_TITLE(index)}
                      </Text>
                    </View>
                    <Switch
                      value={draft.enabled}
                      onValueChange={(next) => handleSectorChange(index, "enabled", next)}
                      trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.action,
                      }}
                      thumbColor={theme.colors.onContrast}
                      accessibilityLabel={UI.SECTOR_TOGGLE_ARIA(index)}
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
                          handleSectorChange(index, "discountPercent", value)
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
                          handleSectorChange(index, "durationHours", value)
                        }
                      />
                      <Text style={adminStyles.adminFieldHint}>{UI.DURATION_HINT}</Text>
                    </View>
                    <View style={adminStyles.adminField}>
                      <Text style={adminStyles.adminFieldLabel}>{UI.CHANCE_LABEL}</Text>
                      <TextInput
                        style={adminStyles.adminInput}
                        keyboardType="number-pad"
                        value={draft.chancePercent}
                        onChangeText={(value) =>
                          handleSectorChange(index, "chancePercent", value)
                        }
                      />
                      <Text style={adminStyles.adminFieldHint}>{UI.CHANCE_HINT}</Text>
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
                          handleSectorChange(index, "prizeProductId", value)
                        }
                      />
                      <Text style={adminStyles.adminFieldHint}>
                        {UI.PRIZE_PRODUCT_HINT}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <Text
                style={[
                  adminStyles.chanceTotal,
                  chanceTotalOk ? adminStyles.chanceTotalOk : null,
                ]}
                accessibilityRole={chanceTotalOk ? "text" : "alert"}
              >
                {chanceTotalOk
                  ? UI.CHANCE_TOTAL_OK(chanceTotal)
                  : UI.CHANCE_TOTAL_ERROR(chanceTotal)}
              </Text>
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
            {UI.STATS(config.spinsTotal ?? 0, config.winsTotal ?? 0)}
          </Text>

          <View style={cardStyles.actions}>
            <Pressable
              style={[
                cardStyles.primaryButton,
                saveMutation.isPending || (mode === "advanced" && !chanceTotalOk)
                  ? cardStyles.primaryButtonDisabled
                  : null,
              ]}
              disabled={
                saveMutation.isPending || (mode === "advanced" && !chanceTotalOk)
              }
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