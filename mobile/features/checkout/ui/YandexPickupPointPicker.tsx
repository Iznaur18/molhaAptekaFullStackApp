import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import {
  buildYandexDeliveryOrderSelection,
  type YandexDeliveryOrderSelection,
} from "@izibuy/shared-lib";

import {
  fetchYandexDeliveryPoints,
  fetchYandexDeliveryQuote,
} from "@/entities/yandex-delivery/api/yandexDeliveryCheckoutApi";
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

type YandexPoints = Awaited<ReturnType<typeof fetchYandexDeliveryPoints>>;
type YandexQuote = Awaited<ReturnType<typeof fetchYandexDeliveryQuote>>;

export type YandexCheckoutItem = { productId: string; quantity: number };

type YandexPickupPointPickerProps = {
  sellerId: string;
  items: readonly YandexCheckoutItem[];
  initialRecipientName?: string;
  initialRecipientPhone?: string;
  disabled?: boolean;
  /** Полный выбор для заказа или `null`, пока чего-то не хватает. */
  onChange: (selection: YandexDeliveryOrderSelection | null) => void;
};

/**
 * Выбор пункта выдачи Яндекс Доставки в оформлении — паритет с web
 * `YandexPickupPointPicker.jsx`.
 *
 * Покупатель вводит город и выбирает пункт; цена считается под выбранный
 * пункт — у Яндекса она зависит от пункта, а не только от города. Наружу
 * уходит только выбор: пункт и получатель.
 */
export const YandexPickupPointPicker = ({
  sellerId,
  items,
  initialRecipientName = "",
  initialRecipientPhone = "",
  disabled = false,
  onChange,
}: YandexPickupPointPickerProps) => {
  const styles = useCdekPickupPointPickerStyles();
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "empty" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [points, setPoints] = useState<YandexPoints>([]);
  /** Номер поиска: новый город — новый список, поиск по адресу с нуля. */
  const [searchRound, setSearchRound] = useState(0);
  const [pointId, setPointId] = useState("");
  const [quote, setQuote] = useState<YandexQuote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<"idle" | "loading" | "error">("idle");
  // Телефон Яндексу нужен обязательно: по нему покупатель получит код выдачи.
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [recipientPhone, setRecipientPhone] = useState(initialRecipientPhone);

  const itemsKey = items.map((item) => `${item.productId}:${item.quantity}`).join(",");

  const handleFind = async () => {
    const query = city.trim();
    if (query.length < 2) return;
    setStatus("loading");
    setError("");
    setPoints([]);
    setPointId("");
    setQuote(null);
    try {
      const found = await fetchYandexDeliveryPoints({ sellerId, city: query });
      setPoints(found);
      setSearchRound((round) => round + 1);
      setStatus(found.length > 0 ? "ready" : "empty");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setStatus("error");
    }
  };

  // Сменились товары — прежние пункты и цена больше не про них.
  useEffect(() => {
    setPoints([]);
    setPointId("");
    setQuote(null);
    setStatus("idle");
  }, [itemsKey, sellerId]);

  // Цена — под выбранный пункт.
  useEffect(() => {
    if (!pointId) {
      setQuote(null);
      setQuoteStatus("idle");
      return undefined;
    }
    let cancelled = false;
    setQuoteStatus("loading");
    setError("");
    fetchYandexDeliveryQuote({
      items: itemsKey.split(",").map((row) => {
        const [productId, quantity] = row.split(":");
        return { productId, quantity: Number(quantity) || 1 };
      }),
      pickupPointId: pointId,
    })
      .then((result) => {
        if (cancelled) return;
        setQuote(result);
        setQuoteStatus("idle");
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setQuote(null);
        setError(caught instanceof Error ? caught.message : String(caught));
        setQuoteStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [pointId, itemsKey]);

  useEffect(() => {
    onChange(
      buildYandexDeliveryOrderSelection({
        pointId,
        quoteAvailable: quote?.available === true,
        recipientName,
        recipientPhone,
      }),
    );
  }, [pointId, quote, recipientName, recipientPhone, onChange]);

  const pointOptions = useMemo<CarrierPickupPoint[]>(
    () =>
      points.map((point) => ({
        id: point.id,
        title: point.address || point.name,
        details: point.instruction,
      })),
    [points],
  );
  const priceText =
    quote?.available && quote.deliverySumRub != null
      ? CHECKOUT_FORM_UI.YANDEX_PRICE(
          formatPriceRub(quote.deliverySumRub),
          quote.deliveryDays ?? null,
        )
      : "";

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
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.YANDEX_NO_POINTS}</Text>
      ) : null}
      {status === "error" || quoteStatus === "error" ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {status === "ready" ? (
        <>
          <CarrierPickupPointList
            key={searchRound}
            label={CHECKOUT_FORM_UI.YANDEX_POINT_LABEL}
            points={pointOptions}
            selectedId={pointId}
            onSelect={setPointId}
            disabled={disabled}
          />

          <CarrierRecipientFields
            name={recipientName}
            phone={recipientPhone}
            onNameChange={setRecipientName}
            onPhoneChange={setRecipientPhone}
            phoneLabel={CHECKOUT_FORM_UI.YANDEX_RECIPIENT_PHONE}
            disabled={disabled}
          />

          {quoteStatus === "loading" ? (
            <Text style={styles.hint}>{CHECKOUT_FORM_UI.YANDEX_PRICING}</Text>
          ) : null}
          {priceText ? <Text style={styles.price}>{priceText}</Text> : null}
          {quote && !quote.available ? (
            <Text style={styles.hint}>{CHECKOUT_FORM_UI.YANDEX_NO_POINTS}</Text>
          ) : null}
          {quote?.exact === false ? (
            <Text style={styles.hint}>{CHECKOUT_FORM_UI.CDEK_APPROXIMATE}</Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
};
