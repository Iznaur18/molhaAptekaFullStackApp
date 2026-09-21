import { useEffect, useId, useState } from "react";

import {
  fetchYandexDeliveryPoints,
  fetchYandexDeliveryQuote,
} from "../../../entities/yandex-delivery/api/yandexDeliveryCheckoutApi.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

// Выглядит так же, как выбор пункта СДЭК: две службы рядом — одна система.
import "./CdekPickupPointPicker.css";

/**
 * Выбор пункта выдачи Яндекс Доставки в оформлении заказа.
 *
 * Покупатель вводит город и выбирает пункт; цена считается под выбранный
 * пункт — у Яндекса она зависит от пункта, а не только от города. Наружу
 * уходит только выбор: пункт и получатель.
 *
 * @param {{
 *   sellerId: string;
 *   items: Array<{ productId: string; quantity: number }>;
 *   initialCity?: string;
 *   initialRecipientName?: string;
 *   initialRecipientPhone?: string;
 *   disabled?: boolean;
 *   onChange: (selection: {
 *     pickupPointId: string;
 *     recipient: { name: string; phone: string };
 *   } | null) => void;
 * }} props
 */
export function YandexPickupPointPicker({
  sellerId,
  items,
  initialCity = "",
  initialRecipientName = "",
  initialRecipientPhone = "",
  disabled = false,
  onChange,
}) {
  const ids = { city: useId(), point: useId(), name: useId(), phone: useId() };
  const [city, setCity] = useState(initialCity);
  const [status, setStatus] = useState(
    /** @type {"idle" | "loading" | "ready" | "empty" | "error"} */ ("idle"),
  );
  const [error, setError] = useState("");
  const [points, setPoints] = useState(/** @type {Array<Record<string, any>>} */ ([]));
  const [pointId, setPointId] = useState("");
  const [quote, setQuote] = useState(/** @type {Record<string, any> | null} */ (null));
  const [quoteStatus, setQuoteStatus] = useState(
    /** @type {"idle" | "loading" | "error"} */ ("idle"),
  );
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
      return undefined;
    }
    let cancelled = false;
    setQuoteStatus("loading");
    fetchYandexDeliveryQuote({ items, pickupPointId: pointId })
      .then((result) => {
        if (cancelled) return;
        setQuote(result);
        setQuoteStatus("idle");
      })
      .catch((caught) => {
        if (cancelled) return;
        setQuote(null);
        setError(caught instanceof Error ? caught.message : String(caught));
        setQuoteStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // items меняется вместе с itemsKey; сам массив в зависимостях дёргал бы расчёт на каждый рендер.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointId, itemsKey]);

  useEffect(() => {
    const name = recipientName.trim();
    const phone = recipientPhone.trim();
    onChange(
      pointId && quote?.available && name.length >= 2 && phone.length >= 10
        ? { pickupPointId: pointId, recipient: { name, phone } }
        : null,
    );
  }, [pointId, quote, recipientName, recipientPhone, onChange]);

  const selectedPoint = points.find((point) => point.id === pointId) ?? null;

  return (
    <div className="cdek-picker">
      <div className="cdek-picker__city">
        <label className="cdek-picker__field" htmlFor={ids.city}>
          <span>{CHECKOUT_FORM_UI.CDEK_CITY_LABEL}</span>
          <input
            id={ids.city}
            type="text"
            value={city}
            placeholder={CHECKOUT_FORM_UI.CDEK_CITY_PLACEHOLDER}
            onChange={(event) => setCity(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleFind();
              }
            }}
            disabled={disabled || status === "loading"}
          />
        </label>
        <button
          type="button"
          className="cdek-picker__find"
          onClick={() => void handleFind()}
          disabled={disabled || status === "loading" || city.trim().length < 2}
        >
          {status === "loading"
            ? CHECKOUT_FORM_UI.CDEK_LOADING
            : CHECKOUT_FORM_UI.CDEK_FIND_POINTS}
        </button>
      </div>

      {status === "empty" ? (
        <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.YANDEX_NO_POINTS}</p>
      ) : null}
      {status === "error" || quoteStatus === "error" ? (
        <p className="cdek-picker__error" role="alert">
          {error}
        </p>
      ) : null}

      {status === "ready" ? (
        <>
          <label className="cdek-picker__field" htmlFor={ids.point}>
            <span>{CHECKOUT_FORM_UI.YANDEX_POINT_LABEL}</span>
            <select
              id={ids.point}
              value={pointId}
              onChange={(event) => setPointId(event.target.value)}
              disabled={disabled}
            >
              <option value="">—</option>
              {points.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.address || point.name}
                </option>
              ))}
            </select>
          </label>

          <label className="cdek-picker__field" htmlFor={ids.name}>
            <span>{CHECKOUT_FORM_UI.CDEK_RECIPIENT_NAME}</span>
            <input
              id={ids.name}
              type="text"
              value={recipientName}
              autoComplete="name"
              onChange={(event) => setRecipientName(event.target.value)}
              disabled={disabled}
            />
          </label>
          <label className="cdek-picker__field" htmlFor={ids.phone}>
            <span>{CHECKOUT_FORM_UI.YANDEX_RECIPIENT_PHONE}</span>
            <input
              id={ids.phone}
              type="tel"
              value={recipientPhone}
              autoComplete="tel"
              placeholder="+7 9XX XXX-XX-XX"
              onChange={(event) => setRecipientPhone(event.target.value)}
              disabled={disabled}
            />
          </label>

          {selectedPoint?.instruction ? (
            <p className="cdek-picker__hint">{selectedPoint.instruction}</p>
          ) : null}
          {quoteStatus === "loading" ? (
            <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.YANDEX_PRICING}</p>
          ) : null}
          {quote?.available ? (
            <p className="cdek-picker__price">
              {CHECKOUT_FORM_UI.YANDEX_PRICE(quote.deliverySumRub, quote.deliveryDays)}
            </p>
          ) : null}
          {quote && !quote.available ? (
            <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.YANDEX_NO_POINTS}</p>
          ) : null}
          {quote?.exact === false ? (
            <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.CDEK_APPROXIMATE}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
