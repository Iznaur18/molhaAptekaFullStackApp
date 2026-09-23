import { useEffect, useId, useState } from "react";

import { fetchYandexExpressQuote } from "../../../entities/yandex-delivery/api/yandexDeliveryCheckoutApi.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

// Та же вёрстка, что у выбора пункта СДЭК и Яндекса.
import "./CdekPickupPointPicker.css";

/** Сколько ждём после правки адреса, прежде чем спросить Яндекс. */
const QUOTE_DEBOUNCE_MS = 500;

/**
 * «Экспресс» в оформлении: цена курьера до точки покупателя и получатель.
 * Адрес покупатель вводит в общих полях доставки — сюда приходят его
 * координаты. Наружу уходит только получатель: цену сервер пересчитает сам.
 *
 * @param {{
 *   items: Array<{ productId: string; quantity: number }>;
 *   geo: { lat: number | string; lon: number | string } | null;
 *   initialRecipientName?: string;
 *   initialRecipientPhone?: string;
 *   disabled?: boolean;
 *   onChange: (selection: { recipient: { name: string; phone: string } } | null) => void;
 * }} props
 */
export function YandexExpressPanel({
  items,
  geo,
  initialRecipientName = "",
  initialRecipientPhone = "",
  disabled = false,
  onChange,
  onCost,
}) {
  const nameId = useId();
  const phoneId = useId();
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [recipientPhone, setRecipientPhone] = useState(initialRecipientPhone);
  const [quote, setQuote] = useState(/** @type {Record<string, any> | null} */ (null));
  const [status, setStatus] = useState(
    /** @type {"idle" | "loading" | "error"} */ ("idle"),
  );
  const [error, setError] = useState("");

  const lat = Number(geo?.lat);
  const lon = Number(geo?.lon);
  const hasGeo = Number.isFinite(lat) && Number.isFinite(lon);
  const itemsKey = items.map((item) => `${item.productId}:${item.quantity}`).join(",");

  useEffect(() => {
    if (!hasGeo) {
      setQuote(null);
      setStatus("idle");
      return undefined;
    }
    let cancelled = false;
    setStatus("loading");
    const timer = setTimeout(() => {
      fetchYandexExpressQuote({ items, toLat: lat, toLon: lon })
        .then((result) => {
          if (cancelled) return;
          setQuote(result);
          setStatus("idle");
        })
        .catch((caught) => {
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
    // items меняется вместе с itemsKey; сам массив дёргал бы расчёт на каждый рендер.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGeo, lat, lon, itemsKey]);

  useEffect(() => {
    const name = recipientName.trim();
    const phone = recipientPhone.trim();
    onChange(
      quote?.available && name.length >= 2 && phone.length >= 10
        ? { recipient: { name, phone } }
        : null,
    );
  }, [quote, recipientName, recipientPhone, onChange]);

  // Цену курьера показывает итог корзины.
  useEffect(() => {
    if (!onCost) return undefined;
    const fee = quote?.available ? Number(quote.deliverySumRub) || 0 : 0;
    onCost(
      fee > 0 ? { feeRub: fee, label: "Яндекс Экспресс", approximate: false } : null,
    );
    return () => onCost(null);
  }, [quote, onCost]);

  return (
    <div className="cdek-picker">
      {!hasGeo ? (
        <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.YANDEX_EXPRESS_NEED_GEO}</p>
      ) : null}
      {status === "loading" ? (
        <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.YANDEX_EXPRESS_PRICING}</p>
      ) : null}
      {status === "error" ? (
        <p className="cdek-picker__error" role="alert">
          {error}
        </p>
      ) : null}
      {quote?.available ? (
        <p className="cdek-picker__price">
          {CHECKOUT_FORM_UI.YANDEX_EXPRESS_PRICE(
            quote.deliverySumRub,
            quote.etaMinutes,
          )}
        </p>
      ) : null}
      {quote && !quote.available ? (
        <p className="cdek-picker__hint">
          {CHECKOUT_FORM_UI.YANDEX_EXPRESS_UNAVAILABLE}
        </p>
      ) : null}

      <label className="cdek-picker__field" htmlFor={nameId}>
        <span>{CHECKOUT_FORM_UI.CDEK_RECIPIENT_NAME}</span>
        <input
          id={nameId}
          type="text"
          value={recipientName}
          autoComplete="name"
          onChange={(event) => setRecipientName(event.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="cdek-picker__field" htmlFor={phoneId}>
        <span>{CHECKOUT_FORM_UI.YANDEX_RECIPIENT_PHONE}</span>
        <input
          id={phoneId}
          type="tel"
          value={recipientPhone}
          autoComplete="tel"
          placeholder="+7 9XX XXX-XX-XX"
          onChange={(event) => setRecipientPhone(event.target.value)}
          disabled={disabled}
        />
      </label>
    </div>
  );
}
