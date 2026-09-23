import { useEffect, useState } from "react";

import { PRODUCT_DELIVERY_CARRIER_LABEL_RU } from "@molha/api-contract";

import { fetchShippingEstimate } from "../../../entities/cart/api/shippingEstimate.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * Примерная стоимость доставки внешней службой.
 *
 * Показываем до оформления: платит покупатель курьеру при получении, и
 * узнавать сумму у двери — плохой сюрприз. Точную цифру всё равно называет
 * курьер, поэтому и пишем «примерно».
 *
 * @param {{
 *   productIds: string[];
 *   deliveryGeo: { lat: number; lon: number } | null;
 *   onCost?: (cost: { feeRub: number; label: string; approximate: boolean } | null) => void;
 * }} props
 */
export function CheckoutShippingEstimate({ productIds, deliveryGeo, onCost }) {
  const [state, setState] = useState(/** @type {any} */ (null));

  const lat = Number(deliveryGeo?.lat);
  const lon = Number(deliveryGeo?.lon);
  const key = productIds.join(",");

  useEffect(() => {
    if (!key || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      setState(null);
      return undefined;
    }

    let cancelled = false;
    void (async () => {
      try {
        const result = await fetchShippingEstimate({
          productIds: key.split(","),
          deliveryLat: lat,
          deliveryLon: lon,
        });
        if (!cancelled) setState(result);
      } catch {
        // Неудачный расчёт не мешает оформить заказ: сумму назовёт курьер.
        if (!cancelled) setState({ available: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, lat, lon]);

  // Цену службы показывает и итог корзины: покупатель должен видеть, во
  // сколько обойдётся заказ вместе с доставкой.
  useEffect(() => {
    if (!onCost) return undefined;
    onCost(
      state?.available
        ? {
            feeRub: Number(state.finalCost) || 0,
            label:
              PRODUCT_DELIVERY_CARRIER_LABEL_RU[state.carrier] ?? String(state.carrier),
            approximate: state.approximate === true,
          }
        : null,
    );
    return () => onCost(null);
  }, [state, onCost]);

  if (!state) return null;
  // Товар везёт продавец или курьеры Gitorg — считать нечего.
  if (!state.available && state.reason === "not_external") return null;

  if (!state.available) {
    return (
      <p className="checkout-form__hint">
        {CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_UNAVAILABLE}
      </p>
    );
  }

  return (
    <p className="checkout-form__hint">
      <strong>
        {(state.approximate === true
          ? CHECKOUT_FORM_UI.SHIPPING_ESTIMATE
          : CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_EXACT)(
          formatPriceRub(state.finalCost),
          PRODUCT_DELIVERY_CARRIER_LABEL_RU[state.carrier] ?? state.carrier,
        )}
      </strong>{" "}
      {state.approximate === true
        ? CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_HINT
        : CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_EXACT_HINT}
    </p>
  );
}
