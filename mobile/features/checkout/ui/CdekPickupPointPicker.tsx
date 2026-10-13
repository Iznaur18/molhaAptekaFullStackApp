import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  buildCdekOrderSelection,
  formatCarrierPeriodDays,
  type CdekOrderSelection,
} from "@izibuy/shared-lib";

import {
  fetchCdekDeliveryPoints,
  fetchCdekQuote,
} from "@/entities/cdek/api/cdekCheckoutApi";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCdekPickupPointPickerStyles } from "@/shared/theme/formChromeStyles";

/** Сколько пунктов показываем сразу; остальные находятся поиском по адресу. */
const CDEK_POINTS_VISIBLE_LIMIT = 20;

type CdekPoints = Awaited<ReturnType<typeof fetchCdekDeliveryPoints>>["points"];
type CdekQuote = Awaited<ReturnType<typeof fetchCdekQuote>>;

type CdekPickupPointPickerProps = {
  sellerId: string;
  productIds: readonly string[];
  initialRecipientName?: string;
  initialRecipientPhone?: string;
  disabled?: boolean;
  /** Полный выбор для заказа или `null`, пока чего-то не хватает. */
  onChange: (selection: CdekOrderSelection | null) => void;
};

/**
 * Выбор пункта выдачи и тарифа СДЭК в оформлении — паритет с web
 * `CdekPickupPointPicker.jsx`.
 *
 * Покупатель вводит город, выбирает пункт и тариф; наружу уходит только выбор
 * (тариф, пункт, город, получатель). Цену сервер при оформлении пересчитает
 * сам по ключу продавца.
 */
export const CdekPickupPointPicker = ({
  sellerId,
  productIds,
  initialRecipientName = "",
  initialRecipientPhone = "",
  disabled = false,
  onChange,
}: CdekPickupPointPickerProps) => {
  const styles = useCdekPickupPointPickerStyles();
  const theme = useAppTheme();
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "empty" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [points, setPoints] = useState<CdekPoints>([]);
  const [cityCode, setCityCode] = useState<number | null>(null);
  const [quote, setQuote] = useState<CdekQuote | null>(null);
  const [pointCode, setPointCode] = useState("");
  const [pointQuery, setPointQuery] = useState("");
  const [tariffCode, setTariffCode] = useState<number | null>(null);
  // Телефон нужен СДЭК обязательно: без него отправление не создать.
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [recipientPhone, setRecipientPhone] = useState(initialRecipientPhone);

  const productKey = productIds.join(",");

  const handleFind = async () => {
    const query = city.trim();
    if (query.length < 2) return;
    setStatus("loading");
    setError("");
    setPoints([]);
    setQuote(null);
    setPointCode("");
    setPointQuery("");
    setTariffCode(null);
    try {
      const found = await fetchCdekDeliveryPoints({ sellerId, city: query });
      if (!found.cityCode || found.points.length === 0) {
        setStatus("empty");
        return;
      }
      const priced = await fetchCdekQuote({
        productIds: [...productIds],
        toCityCode: found.cityCode,
      });
      setPoints(found.points);
      setCityCode(found.cityCode);
      setQuote(priced);
      setTariffCode(priced.best?.tariffCode ?? priced.options[0]?.tariffCode ?? null);
      setStatus(priced.available ? "ready" : "empty");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setStatus("error");
    }
  };

  // Сменились товары в корзине — прежний расчёт больше не про них.
  useEffect(() => {
    setQuote(null);
    setPoints([]);
    setPointCode("");
    setPointQuery("");
    setTariffCode(null);
    setStatus("idle");
  }, [productKey, sellerId]);

  useEffect(() => {
    onChange(
      buildCdekOrderSelection({
        pointCode,
        tariffCode,
        cityCode,
        recipientName,
        recipientPhone,
      }),
    );
  }, [pointCode, tariffCode, cityCode, recipientName, recipientPhone, onChange]);

  const selectedTariff = useMemo(
    () => quote?.options.find((option) => option.tariffCode === tariffCode) ?? null,
    [quote, tariffCode],
  );
  const selectedPoint = points.find((point) => point.code === pointCode) ?? null;
  // В большом городе пунктов сотни: на сайте это выпадающий список, здесь —
  // поиск по адресу и первые совпадения, иначе шторка превращается в простыню.
  const matchedPoints = useMemo(() => {
    const query = pointQuery.trim().toLowerCase();
    return query
      ? points.filter((point) => point.address.toLowerCase().includes(query))
      : points;
  }, [points, pointQuery]);
  const visiblePoints = useMemo(() => {
    const head = matchedPoints.slice(0, CDEK_POINTS_VISIBLE_LIMIT);
    // Выбранный пункт остаётся на виду, даже если поиск его уже не находит.
    return selectedPoint && !head.includes(selectedPoint)
      ? [selectedPoint, ...head]
      : head;
  }, [matchedPoints, selectedPoint]);
  const isBusy = disabled || status === "loading";
  const canFind = !isBusy && city.trim().length >= 2;

  return (
    <View style={styles.root}>
      <View style={styles.field}>
        <Text style={styles.label}>{CHECKOUT_FORM_UI.CDEK_CITY_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder={CHECKOUT_FORM_UI.CDEK_CITY_PLACEHOLDER}
          placeholderTextColor={theme.colors.textMuted}
          editable={!isBusy}
          returnKeyType="search"
          onSubmitEditing={() => void handleFind()}
        />
      </View>
      <Pressable
        style={[styles.findButton, !canFind && styles.disabled]}
        onPress={() => void handleFind()}
        disabled={!canFind}
        accessibilityRole="button"
      >
        <Text style={styles.findButtonText}>
          {status === "loading"
            ? CHECKOUT_FORM_UI.CDEK_LOADING
            : CHECKOUT_FORM_UI.CDEK_FIND_POINTS}
        </Text>
      </Pressable>

      {status === "empty" ? (
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.CDEK_NO_POINTS}</Text>
      ) : null}
      {status === "error" ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {status === "ready" && quote ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>{CHECKOUT_FORM_UI.CDEK_TARIFF_LABEL}</Text>
            <View style={styles.options} accessibilityRole="radiogroup">
              {quote.options.map((option) => {
                const active = option.tariffCode === tariffCode;
                const period = formatCarrierPeriodDays(
                  option.periodMinDays,
                  option.periodMaxDays,
                );
                return (
                  <Pressable
                    key={option.tariffCode}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => setTariffCode(option.tariffCode)}
                    disabled={disabled}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active, disabled }}
                  >
                    <Text style={styles.optionTitle}>{option.tariffName}</Text>
                    <Text style={styles.optionMeta}>
                      {formatPriceRub(option.deliverySumRub)}
                      {period ? ` · ${period}` : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{CHECKOUT_FORM_UI.CDEK_POINT_LABEL}</Text>
            {points.length > CDEK_POINTS_VISIBLE_LIMIT ? (
              <TextInput
                style={styles.input}
                value={pointQuery}
                onChangeText={setPointQuery}
                placeholder={CHECKOUT_FORM_UI.CDEK_POINT_SEARCH_PLACEHOLDER}
                placeholderTextColor={theme.colors.textMuted}
                editable={!disabled}
              />
            ) : null}
            <View style={styles.options} accessibilityRole="radiogroup">
              {visiblePoints.map((point) => {
                const active = point.code === pointCode;
                return (
                  <Pressable
                    key={point.code}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => setPointCode(point.code)}
                    disabled={disabled}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active, disabled }}
                  >
                    <Text style={styles.optionTitle}>{point.address}</Text>
                    {active && point.workTime ? (
                      <Text style={styles.optionMeta}>{point.workTime}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            {matchedPoints.length > visiblePoints.length ? (
              <Text style={styles.hint}>
                {CHECKOUT_FORM_UI.CDEK_POINTS_MORE(
                  visiblePoints.length,
                  matchedPoints.length,
                )}
              </Text>
            ) : null}
            {matchedPoints.length === 0 ? (
              <Text style={styles.hint}>
                {CHECKOUT_FORM_UI.CDEK_POINTS_NOT_MATCHED}
              </Text>
            ) : null}
            {!selectedPoint && matchedPoints.length > 0 ? (
              <Text style={styles.hint}>{CHECKOUT_FORM_UI.CDEK_POINT_PLACEHOLDER}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{CHECKOUT_FORM_UI.CDEK_RECIPIENT_NAME}</Text>
            <TextInput
              style={styles.input}
              value={recipientName}
              onChangeText={setRecipientName}
              editable={!disabled}
              autoComplete="name"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{CHECKOUT_FORM_UI.CDEK_RECIPIENT_PHONE}</Text>
            <TextInput
              style={styles.input}
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              editable={!disabled}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder={CHECKOUT_FORM_UI.CDEK_RECIPIENT_PHONE_PLACEHOLDER}
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          {selectedTariff ? (
            <Text style={styles.price}>
              {formatPriceRub(selectedTariff.deliverySumRub)}
              {formatCarrierPeriodDays(
                selectedTariff.periodMinDays,
                selectedTariff.periodMaxDays,
              )
                ? ` · ${formatCarrierPeriodDays(
                    selectedTariff.periodMinDays,
                    selectedTariff.periodMaxDays,
                  )}`
                : ""}
            </Text>
          ) : null}
          <Text style={styles.hint}>{CHECKOUT_FORM_UI.CDEK_PAY_ON_PICKUP}</Text>
          {quote.exact === false ? (
            <Text style={styles.hint}>{CHECKOUT_FORM_UI.CDEK_APPROXIMATE}</Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
};
