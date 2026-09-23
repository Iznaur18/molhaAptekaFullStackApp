import { useEffect, useMemo, useState } from "react";

import {
  fetchCdekDeliveryPoints,
  fetchCdekQuote,
} from "../../../entities/cdek/api/cdekCheckoutApi.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

import "./CdekPickupPointPicker.css";

/**
 * Выбор пункта выдачи и тарифа СДЭК в оформлении заказа.
 *
 * Покупатель вводит город, выбирает пункт и тариф; наружу уходит только выбор
 * (тариф, пункт, город). Цену сервер при оформлении пересчитает сам.
 *
 * @param {{
 *   sellerId: string;
 *   productIds: string[];
 *   initialCity?: string;
 *   initialRecipientName?: string;
 *   initialRecipientPhone?: string;
 *   disabled?: boolean;
 *   onChange: (selection: {
 *     tariffCode: number;
 *     pickupPointCode: string;
 *     toCityCode: number;
 *     recipient: { name: string; phone: string };
 *   } | null) => void;
 * }} props
 */
export function CdekPickupPointPicker({
  sellerId,
  productIds,
  initialCity = "",
  initialRecipientName = "",
  initialRecipientPhone = "",
  disabled = false,
  onChange,
  onCost,
}) {
  const [city, setCity] = useState(initialCity);
  const [status, setStatus] = useState(
    /** @type {"idle" | "loading" | "ready" | "empty" | "error"} */ ("idle"),
  );
  const [error, setError] = useState("");
  const [points, setPoints] = useState(
    /** @type {import('@molha/api-contract').CdekDeliveryPoint[]} */ ([]),
  );
  const [cityCode, setCityCode] = useState(/** @type {number | null} */ (null));
  const [quote, setQuote] = useState(
    /** @type {{ options: any[]; exact?: boolean } | null} */ (null),
  );
  const [pointCode, setPointCode] = useState("");
  const [tariffCode, setTariffCode] = useState(/** @type {number | null} */ (null));
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
        productIds,
        toCityCode: found.cityCode,
      });
      setPoints(found.points);
      setCityCode(found.cityCode);
      setQuote(priced);
      setTariffCode(
        priced?.best?.tariffCode ?? priced?.options?.[0]?.tariffCode ?? null,
      );
      setStatus(priced?.available ? "ready" : "empty");
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
    const name = recipientName.trim();
    const phone = recipientPhone.trim();
    onChange(
      pointCode && tariffCode && cityCode && name.length >= 2 && phone.length >= 10
        ? {
            tariffCode,
            pickupPointCode: pointCode,
            toCityCode: cityCode,
            recipient: { name, phone },
          }
        : null,
    );
  }, [pointCode, tariffCode, cityCode, recipientName, recipientPhone, onChange]);

  const selectedTariff = useMemo(
    () => quote?.options?.find((option) => option.tariffCode === tariffCode) ?? null,
    [quote, tariffCode],
  );
  const selectedPoint = points.find((point) => point.code === pointCode) ?? null;

  // Цену выбранного тарифа показывает итог корзины.
  useEffect(() => {
    if (!onCost) return undefined;
    const fee = Number(selectedTariff?.deliverySumRub) || 0;
    onCost(fee > 0 ? { feeRub: fee, label: "СДЭК", approximate: false } : null);
    return () => onCost(null);
  }, [selectedTariff, onCost]);

  return (
    <div className="cdek-picker">
      <div className="cdek-picker__city">
        <label className="cdek-picker__field">
          <span>{CHECKOUT_FORM_UI.CDEK_CITY_LABEL}</span>
          <input
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
        <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.CDEK_NO_POINTS}</p>
      ) : null}
      {status === "error" ? (
        <p className="cdek-picker__error" role="alert">
          {error}
        </p>
      ) : null}

      {status === "ready" ? (
        <>
          <label className="cdek-picker__field">
            <span>{CHECKOUT_FORM_UI.CDEK_TARIFF_LABEL}</span>
            <select
              value={tariffCode ?? ""}
              onChange={(event) => setTariffCode(Number(event.target.value))}
              disabled={disabled}
            >
              {quote.options.map((option) => (
                <option key={option.tariffCode} value={option.tariffCode}>
                  {option.tariffName} — {option.deliverySumRub} ₽,{" "}
                  {CHECKOUT_FORM_UI.CDEK_PERIOD(
                    option.periodMinDays,
                    option.periodMaxDays,
                  )}
                </option>
              ))}
            </select>
          </label>

          <label className="cdek-picker__field">
            <span>{CHECKOUT_FORM_UI.CDEK_POINT_LABEL}</span>
            <select
              value={pointCode}
              onChange={(event) => setPointCode(event.target.value)}
              disabled={disabled}
            >
              <option value="">—</option>
              {points.map((point) => (
                <option key={point.code} value={point.code}>
                  {point.address}
                </option>
              ))}
            </select>
          </label>

          <label className="cdek-picker__field">
            <span>{CHECKOUT_FORM_UI.CDEK_RECIPIENT_NAME}</span>
            <input
              type="text"
              value={recipientName}
              autoComplete="name"
              onChange={(event) => setRecipientName(event.target.value)}
              disabled={disabled}
            />
          </label>
          <label className="cdek-picker__field">
            <span>{CHECKOUT_FORM_UI.CDEK_RECIPIENT_PHONE}</span>
            <input
              type="tel"
              value={recipientPhone}
              autoComplete="tel"
              placeholder="+7 9XX XXX-XX-XX"
              onChange={(event) => setRecipientPhone(event.target.value)}
              disabled={disabled}
            />
          </label>

          {selectedPoint?.workTime ? (
            <p className="cdek-picker__hint">{selectedPoint.workTime}</p>
          ) : null}

          {selectedTariff ? (
            <p className="cdek-picker__price">
              {selectedTariff.deliverySumRub} ₽ ·{" "}
              {CHECKOUT_FORM_UI.CDEK_PERIOD(
                selectedTariff.periodMinDays,
                selectedTariff.periodMaxDays,
              )}
            </p>
          ) : null}
          <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.CDEK_PAY_ON_PICKUP}</p>
          {quote?.exact === false ? (
            <p className="cdek-picker__hint">{CHECKOUT_FORM_UI.CDEK_APPROXIMATE}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
