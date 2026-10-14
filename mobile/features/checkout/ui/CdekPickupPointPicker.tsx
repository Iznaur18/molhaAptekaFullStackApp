import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  buildCdekOrderSelection,
  formatCarrierPeriodDays,
  type CdekOrderSelection,
} from "@izibuy/shared-lib";

import {
  fetchCdekDeliveryPoints,
  fetchCdekQuote,
} from "@/entities/cdek/api/cdekCheckoutApi";
import {
  CarrierCitySearch,
  CarrierRecipientFields,
} from "@/features/checkout/ui/CarrierPickerParts";
import {
  CarrierPickupPointList,
  type CarrierPickupPoint,
} from "@/features/checkout/ui/CarrierPickupPointList";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useCdekPickupPointPickerStyles } from "@/shared/theme/formChromeStyles";

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
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "empty" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [points, setPoints] = useState<CdekPoints>([]);
  const [cityCode, setCityCode] = useState<number | null>(null);
  const [quote, setQuote] = useState<CdekQuote | null>(null);
  const [pointCode, setPointCode] = useState("");
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
  const selectedTariffPeriod = selectedTariff
    ? formatCarrierPeriodDays(
        selectedTariff.periodMinDays,
        selectedTariff.periodMaxDays,
      )
    : "";
  const pointOptions = useMemo<CarrierPickupPoint[]>(
    () =>
      points.map((point) => ({
        id: point.code,
        title: point.address,
        details: point.workTime,
      })),
    [points],
  );

  return (
    <View style={styles.root}>
      <CarrierCitySearch
        city={city}
        onCityChange={setCity}
        onFind={() => void handleFind()}
        isLoading={status === "loading"}
        disabled={disabled}
      />

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

          <CarrierPickupPointList
            // Новый город — новый список: поиск по адресу начинается заново.
            key={cityCode ?? "no-city"}
            label={CHECKOUT_FORM_UI.CDEK_POINT_LABEL}
            points={pointOptions}
            selectedId={pointCode}
            onSelect={setPointCode}
            disabled={disabled}
          />

          <CarrierRecipientFields
            name={recipientName}
            phone={recipientPhone}
            onNameChange={setRecipientName}
            onPhoneChange={setRecipientPhone}
            phoneLabel={CHECKOUT_FORM_UI.CDEK_RECIPIENT_PHONE}
            disabled={disabled}
          />

          {selectedTariff ? (
            <Text style={styles.price}>
              {formatPriceRub(selectedTariff.deliverySumRub)}
              {selectedTariffPeriod ? ` · ${selectedTariffPeriod}` : ""}
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
