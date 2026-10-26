import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import {
  fetchYandexExpressQuote,
  type YandexExpressQuote,
} from "@/entities/yandex-delivery/api/yandexDeliveryCheckoutApi";
import { CarrierRecipientFields } from "@/features/checkout/ui/CarrierPickerParts";
import type { YandexCheckoutItem } from "@/features/checkout/ui/YandexPickupPointPicker";
import {
  buildYandexExpressOrderSelection,
  type YandexExpressOrderSelection,
} from "@/features/checkout/lib/yandexExpressSelection";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useCdekPickupPointPickerStyles } from "@/shared/theme/formChromeStyles";

/** Сколько ждём после правки адреса, прежде чем спросить Яндекс. */
const QUOTE_DEBOUNCE_MS = 500;

type YandexExpressPanelProps = {
  items: readonly YandexCheckoutItem[];
  /** Точка адреса покупателя: из подсказки или с карты. */
  geo: { lat: number; lon: number } | null;
  initialRecipientName?: string;
  initialRecipientPhone?: string;
  disabled?: boolean;
  onChange: (selection: YandexExpressOrderSelection | null) => void;
};

/**
 * «Экспресс» в оформлении — паритет web `YandexExpressPanel`: цена курьера до
 * точки покупателя и получатель. Адрес покупатель вводит в общих полях
 * доставки — сюда приходят его координаты. Наружу уходит только получатель:
 * цену сервер пересчитает сам.
 */
export const YandexExpressPanel = ({
  items,
  geo,
  initialRecipientName = "",
  initialRecipientPhone = "",
  disabled = false,
  onChange,
}: YandexExpressPanelProps) => {
  const styles = useCdekPickupPointPickerStyles();
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [recipientPhone, setRecipientPhone] = useState(initialRecipientPhone);
  const [quote, setQuote] = useState<YandexExpressQuote | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const lat = Number(geo?.lat);
  const lon = Number(geo?.lon);
  const hasGeo = geo != null && Number.isFinite(lat) && Number.isFinite(lon);
  const itemsKey = items.map((item) => `${item.productId}:${item.quantity}`).join(",");

  useEffect(() => {
    if (!hasGeo) {
      setQuote(null);
      setStatus("idle");
      return undefined;
    }
    let cancelled = false;
    setStatus("loading");
    setError("");
    const timer = setTimeout(() => {
      fetchYandexExpressQuote({
        items: itemsKey.split(",").map((row) => {
          const [productId, quantity] = row.split(":");
          return { productId, quantity: Number(quantity) || 1 };
        }),
        toLat: lat,
        toLon: lon,
      })
        .then((result) => {
          if (cancelled) return;
          setQuote(result);
          setStatus("idle");
        })
        .catch((caught: unknown) => {
          if (cancelled) return;
          setQuote(null);
          setError(caught instanceof Error ? caught.message : String(caught));
          setStatus("error");
        });
    }, QUOTE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hasGeo, lat, lon, itemsKey]);

  useEffect(() => {
    onChange(
      buildYandexExpressOrderSelection({
        quoteAvailable: quote?.available === true,
        recipientName,
        recipientPhone,
      }),
    );
  }, [quote, recipientName, recipientPhone, onChange]);

  const priceText =
    quote?.available && quote.deliverySumRub != null
      ? CHECKOUT_FORM_UI.YANDEX_EXPRESS_PRICE(
          formatPriceRub(quote.deliverySumRub),
          quote.etaMinutes ?? null,
        )
      : "";

  return (
    <View style={styles.root}>
      {!hasGeo ? (
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.YANDEX_EXPRESS_NEED_GEO}</Text>
      ) : null}
      {status === "loading" ? (
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.YANDEX_EXPRESS_PRICING}</Text>
      ) : null}
      {status === "error" ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {priceText ? <Text style={styles.price}>{priceText}</Text> : null}
      {quote && !quote.available ? (
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.YANDEX_EXPRESS_UNAVAILABLE}</Text>
      ) : null}
      <CarrierRecipientFields
        name={recipientName}
        phone={recipientPhone}
        onNameChange={setRecipientName}
        onPhoneChange={setRecipientPhone}
        phoneLabel={CHECKOUT_FORM_UI.YANDEX_RECIPIENT_PHONE}
        disabled={disabled}
      />
    </View>
  );
};
